import { asyncHandler } from "../utils/asyncHandler.js";
import { makeSlug } from "../helpers/slug.js";
import { ApiError } from "../utils/ApiError.js";
import { execute, id, json, mapProduct, parseJson, row, rows } from "../lib/sql.js";
import { apiCache } from "../utils/cache.js";

const PUBLIC_CATALOG_CACHE = "public, max-age=30, stale-while-revalidate=300";
const SUGGESTION_CACHE = "public, max-age=15, stale-while-revalidate=120";

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, brand, gender, min, max, sort = "latest", page = 1, limit = 12 } = req.query as any;
  const cacheKey = `products:${JSON.stringify({ q, category, brand, gender, min, max, sort, page, limit })}`;
  
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    res.set("Cache-Control", PUBLIC_CATALOG_CACHE);
    return res.json(cachedData);
  }

  const clauses: string[] = [];
  const params: Record<string, unknown> = { offset: (Number(page) - 1) * Number(limit), limit: Number(limit) };
  if (q) {
    clauses.push(`(
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')) @@ plainto_tsquery('english', :q)
      OR title ILIKE :likeQ
      OR brand ILIKE :likeQ
      OR description ILIKE :likeQ
      OR short_description ILIKE :likeQ
      OR sku ILIKE :likeQ
      OR tags::text ILIKE :likeQ
      OR EXISTS (
        SELECT 1 FROM categories
        WHERE categories.id = products.category_id
          AND (categories.name ILIKE :likeQ OR categories.slug ILIKE :likeQ)
      )
      OR EXISTS (
        SELECT 1 FROM subcategories
        WHERE subcategories.id = products.subcategory_id
          AND (subcategories.name ILIKE :likeQ OR subcategories.slug ILIKE :likeQ)
      )
    )`);
    params.q = q;
    params.likeQ = `%${q}%`;
  }
  if (category) {
    clauses.push("(category_id = :category OR category_id IN (SELECT id FROM categories WHERE slug = :category OR name = :category))");
    params.category = category;
  }
  if (brand) {
    clauses.push("brand = :brand");
    params.brand = brand;
  }
  if (gender) {
    clauses.push("gender = :gender");
    params.gender = gender;
  }
  if (min) {
    clauses.push("sale_price >= :min");
    params.min = Number(min);
  }
  if (max) {
    clauses.push("sale_price <= :max");
    params.max = Number(max);
  }

  const sortMap: Record<string, string> = {
    latest: "created_at DESC",
    "price-asc": "sale_price ASC",
    "price-desc": "sale_price DESC",
    rating: "rating_average DESC",
    popular: "bestseller DESC, trending DESC"
  };
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const productSelect = q
    ? "products.*, ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')), plainto_tsquery('english', :q)) AS search_score"
    : "products.*";
  const orderBy = q && sort === "latest" ? "search_score DESC, created_at DESC" : (sortMap[sort] ?? sortMap.latest);
  const [items, total] = await Promise.all([
    rows(`SELECT ${productSelect} FROM products ${where} ORDER BY ${orderBy} LIMIT :limit OFFSET :offset`, params),
    row<{ total: number }>(`SELECT COUNT(*) AS total FROM products ${where}`, params)
  ]);
  
  const responseData = { success: true, items: items.map(mapProduct), total: total?.total ?? 0, page: Number(page), pages: Math.ceil((total?.total ?? 0) / Number(limit)) };
  apiCache.set(cacheKey, responseData, 60); // Cache for 60 seconds
  
  res.set("Cache-Control", PUBLIC_CATALOG_CACHE);
  res.json(responseData);
});

export const listProductSuggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const limit = Math.min(Number(req.query.limit ?? 6), 8);
  if (q.length < 2) {
    res.set("Cache-Control", SUGGESTION_CACHE);
    return res.json({ success: true, suggestions: [] });
  }

  const cacheKey = `suggestions:${q}:${limit}`;
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    res.set("Cache-Control", SUGGESTION_CACHE);
    return res.json(cachedData);
  }

  const params = {
    likeQ: `%${q}%`,
    prefixQ: `${q}%`,
    limit
  };
  const suggestions = await rows<{
    id: string;
    title: string;
    slug: string;
    brand: string;
    images: string;
    price: number;
    sale_price: number;
    category: string | null;
  }>(
    `SELECT products.id, products.title, products.slug, products.brand, products.images,
      products.price, products.sale_price, categories.name AS category
    FROM products
    LEFT JOIN categories ON categories.id = products.category_id
    WHERE products.title ILIKE :likeQ
      OR products.brand ILIKE :likeQ
      OR products.sku ILIKE :likeQ
      OR categories.name ILIKE :likeQ
    ORDER BY
      CASE
        WHEN products.title ILIKE :prefixQ THEN 0
        WHEN products.brand ILIKE :prefixQ THEN 1
        ELSE 2
      END,
      products.bestseller DESC,
      products.trending DESC,
      products.rating_count DESC,
      products.title ASC
    LIMIT :limit`,
    params
  );

  const responseData = {
    success: true,
    suggestions: suggestions.map((product) => {
      const images = parseJson<any[]>(product.images, []);
      const image = images.map((item) => (typeof item === "string" ? item : item?.url)).find(Boolean) ?? "";
      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        brand: product.brand,
        category: product.category ?? "",
        image,
        price: Number(product.price),
        salePrice: Number(product.sale_price)
      };
    })
  };

  apiCache.set(cacheKey, responseData, 30); // Cache for 30 seconds
  res.set("Cache-Control", SUGGESTION_CACHE);
  res.json(responseData);
});

export const getProduct = asyncHandler(async (req, res) => {
  const cacheKey = `product:${req.params.slug}`;
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  
  const product = mapProduct(await row("SELECT * FROM products WHERE slug = :slug", { slug: req.params.slug }));
  if (!product) throw new ApiError(404, "Product not found");
  
  const responseData = { success: true, product };
  apiCache.set(cacheKey, responseData, 60); // Cache for 60 seconds
  res.json(responseData);
});

export const createProduct = asyncHandler(async (req, res) => {
  apiCache.clear();
  const body = req.body;
  body.slug = body.slug ? makeSlug(body.slug) : makeSlug(body.title);
  body.discountPercentage = body.price ? Math.round(((body.price - body.salePrice) / body.price) * 100) : 0;
  if (Array.isArray(body.variants) && body.variants.length) {
    body.stock = body.variants.reduce((sum: number, variant: any) => sum + (variant.available === false ? 0 : Number(variant.stock ?? 0)), 0);
    body.price = Math.min(...body.variants.map((variant: any) => Number(variant.price ?? body.price)));
    body.salePrice = Math.min(...body.variants.map((variant: any) => Number(variant.salePrice ?? body.salePrice)));
    body.discountPercentage = body.price ? Math.round(((body.price - body.salePrice) / body.price) * 100) : 0;
  }
  const productId = id();
  await execute(
    `INSERT INTO products (
      id, title, slug, description, short_description, brand, category_id, subcategory_id, gender, tags,
      price, sale_price, discount_percentage, stock, sku, colors, sizes, images, featured, trending,
      bestseller, seo_title, seo_description, meta_keywords, rating_distribution, variants, summary,
      description_html, care_instructions, size_chart, delivery_info, return_policy
    ) VALUES (
      :id, :title, :slug, :description, :shortDescription, :brand, :category, :subCategory, :gender, :tags,
      :price, :salePrice, :discountPercentage, :stock, :sku, :colors, :sizes, :images, :featured, :trending,
      :bestseller, :seoTitle, :seoDescription, :metaKeywords, :ratingDistribution, :variants, :summary,
      :descriptionHtml, :careInstructions, :sizeChart, :deliveryInfo, :returnPolicy
    )`,
    {
      id: productId,
      ...body,
      subCategory: body.subCategory || null,
      tags: json(body.tags),
      colors: json(body.colors),
      sizes: json(body.sizes),
      images: json(body.images),
      variants: json(body.variants),
      summary: json(body.summary),
      descriptionHtml: body.descriptionHtml ?? null,
      careInstructions: json(body.careInstructions),
      sizeChart: json(body.sizeChart),
      deliveryInfo: json(body.deliveryInfo),
      returnPolicy: body.returnPolicy ?? null,
      metaKeywords: json(body.metaKeywords),
      ratingDistribution: json({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    }
  );
  const product = mapProduct(await row("SELECT * FROM products WHERE id = :id", { id: productId }));
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  apiCache.clear();
  if (req.body.title && !req.body.slug) req.body.slug = makeSlug(req.body.title);
  const existing = await row("SELECT * FROM products WHERE id = :id", { id: req.params.id });
  if (!existing) throw new ApiError(404, "Product not found");
  const next = { ...mapProduct(existing), ...req.body };
  if (Array.isArray(next.variants) && next.variants.length) {
    next.stock = next.variants.reduce((sum: number, variant: any) => sum + (variant.available === false ? 0 : Number(variant.stock ?? 0)), 0);
    next.price = Math.min(...next.variants.map((variant: any) => Number(variant.price ?? next.price)));
    next.salePrice = Math.min(...next.variants.map((variant: any) => Number(variant.salePrice ?? next.salePrice)));
  }
  next.discountPercentage = next.price ? Math.round(((next.price - next.salePrice) / next.price) * 100) : 0;
  await execute(
    `UPDATE products SET title=:title, slug=:slug, description=:description, short_description=:shortDescription,
      brand=:brand, category_id=:category, subcategory_id=:subCategory, gender=:gender, tags=:tags,
      price=:price, sale_price=:salePrice, discount_percentage=:discountPercentage, stock=:stock, sku=:sku,
      colors=:colors, sizes=:sizes, images=:images, featured=:featured, trending=:trending, bestseller=:bestseller,
      seo_title=:seoTitle, seo_description=:seoDescription, meta_keywords=:metaKeywords, variants=:variants,
      summary=:summary, description_html=:descriptionHtml, care_instructions=:careInstructions,
      size_chart=:sizeChart, delivery_info=:deliveryInfo, return_policy=:returnPolicy WHERE id=:id`,
    {
      id: req.params.id,
      ...next,
      subCategory: next.subCategory || null,
      tags: json(next.tags),
      colors: json(next.colors),
      sizes: json(next.sizes),
      images: json(next.images),
      variants: json(next.variants),
      summary: json(next.summary),
      descriptionHtml: next.descriptionHtml || null,
      careInstructions: json(next.careInstructions),
      sizeChart: json(next.sizeChart),
      deliveryInfo: json(next.deliveryInfo),
      returnPolicy: next.returnPolicy || null,
      metaKeywords: json(next.metaKeywords)
    }
  );
  const product = mapProduct(await row("SELECT * FROM products WHERE id = :id", { id: req.params.id }));
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  apiCache.clear();
  await execute("DELETE FROM products WHERE id = :id", { id: req.params.id });
  res.json({ success: true });
});

export const createCategory = asyncHandler(async (req, res) => {
  apiCache.clear();
  const category = { id: id(), ...req.body, slug: makeSlug(req.body.slug || req.body.name) };
  await execute("INSERT INTO categories (id, name, slug, image, banner) VALUES (:id, :name, :slug, :image, :banner)", {
    ...category,
    image: category.image ?? null,
    banner: category.banner ?? null
  });
  res.status(201).json({ success: true, category });
});

export const listCategories = asyncHandler(async (_req, res) => {
  const cacheKey = "categories";
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    res.set("Cache-Control", PUBLIC_CATALOG_CACHE);
    return res.json(cachedData);
  }

  const categories = await rows(`SELECT categories.*, COUNT(products.id) AS product_count
    FROM categories LEFT JOIN products ON products.category_id = categories.id
    GROUP BY categories.id ORDER BY categories.name ASC`);
  
  const responseData = { success: true, categories };
  apiCache.set(cacheKey, responseData, 300); // Cache for 5 mins
  
  res.set("Cache-Control", PUBLIC_CATALOG_CACHE);
  res.json(responseData);
});

export const updateCategory = asyncHandler(async (req, res) => {
  apiCache.clear();
  const existing = await row("SELECT * FROM categories WHERE id = :id", { id: req.params.id });
  if (!existing) throw new ApiError(404, "Category not found");
  const next = {
    name: req.body.name ?? existing.name,
    slug: makeSlug(req.body.slug || req.body.name || existing.slug),
    image: req.body.image ?? existing.image,
    banner: req.body.banner ?? existing.banner
  };
  await execute("UPDATE categories SET name = :name, slug = :slug, image = :image, banner = :banner WHERE id = :id", {
    id: req.params.id,
    ...next
  });
  const category = await row("SELECT * FROM categories WHERE id = :id", { id: req.params.id });
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  apiCache.clear();
  const usage = await row<{ total: number }>("SELECT COUNT(*) AS total FROM products WHERE category_id = :id", { id: req.params.id });
  if ((usage?.total ?? 0) > 0) throw new ApiError(409, "Category is used by products. Move or delete those products first.");
  await execute("DELETE FROM subcategories WHERE category_id = :id", { id: req.params.id });
  await execute("DELETE FROM categories WHERE id = :id", { id: req.params.id });
  res.json({ success: true });
});

export const createSubCategory = asyncHandler(async (req, res) => {
  apiCache.clear();
  const subCategory = { id: id(), ...req.body, slug: makeSlug(req.body.slug || req.body.name) };
  await execute("INSERT INTO subcategories (id, name, slug, category_id) VALUES (:id, :name, :slug, :categoryId)", subCategory);
  res.status(201).json({ success: true, subCategory });
});

export const listSubCategories = asyncHandler(async (req, res) => {
  const { categoryId } = req.query as any;
  const cacheKey = `subcategories:${categoryId ?? "all"}`;
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const params: Record<string, unknown> = {};
  const where = categoryId ? "WHERE category_id = :categoryId" : "";
  if (categoryId) params.categoryId = categoryId;
  const subCategories = await rows(`SELECT * FROM subcategories ${where} ORDER BY name ASC`, params);
  
  const responseData = { success: true, subCategories };
  apiCache.set(cacheKey, responseData, 300); // Cache for 5 mins
  res.json(responseData);
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  apiCache.clear();
  const existing = await row("SELECT * FROM subcategories WHERE id = :id", { id: req.params.id });
  if (!existing) throw new ApiError(404, "Subcategory not found");
  const next = {
    name: req.body.name ?? existing.name,
    slug: makeSlug(req.body.slug || req.body.name || existing.slug),
    categoryId: req.body.categoryId ?? existing.category_id
  };
  await execute("UPDATE subcategories SET name = :name, slug = :slug, category_id = :categoryId WHERE id = :id", {
    id: req.params.id,
    ...next
  });
  const subCategory = await row("SELECT * FROM subcategories WHERE id = :id", { id: req.params.id });
  res.json({ success: true, subCategory });
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  apiCache.clear();
  await execute("UPDATE products SET subcategory_id = NULL WHERE subcategory_id = :id", { id: req.params.id });
  await execute("DELETE FROM subcategories WHERE id = :id", { id: req.params.id });
  res.json({ success: true });
});
