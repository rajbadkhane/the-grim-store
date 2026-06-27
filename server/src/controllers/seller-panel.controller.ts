import { makeSlug } from "../helpers/slug.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { execute, id, json, mapOrder, mapProduct, mapSellerProfile, row, rows } from "../lib/sql.js";
import { apiCache } from "../utils/cache.js";

const VISIBLE_ORDER_SQL = `(COALESCE(payment_info ->> 'method', '') <> 'razorpay' OR payment_status IN ('paid', 'refunded'))`;

async function getActiveSellerProfile(userId: string) {
  return mapSellerProfile(await row("SELECT * FROM seller_profiles WHERE user_id = :userId AND status = 'active'", { userId }));
}

async function requireSellerProfile(userId: string) {
  const profile = await getActiveSellerProfile(userId);
  if (!profile) throw new ApiError(403, "Approved seller profile required");
  return profile;
}

function prepareProductBody(body: any, profile: any, existing?: any) {
  const next = { ...(existing ?? {}), ...body };
  next.slug = next.slug ? makeSlug(next.slug) : makeSlug(next.title);
  if (Array.isArray(next.variants) && next.variants.length) {
    next.stock = next.variants.reduce((sum: number, variant: any) => sum + (variant.available === false ? 0 : Number(variant.stock ?? 0)), 0);
    next.price = Math.min(...next.variants.map((variant: any) => Number(variant.price ?? next.price)));
    next.salePrice = Math.min(...next.variants.map((variant: any) => Number(variant.salePrice ?? next.salePrice)));
  }
  next.discountPercentage = next.price ? Math.round(((next.price - next.salePrice) / next.price) * 100) : 0;
  next.sellerId = profile.userId;
  next.sellerName = profile.businessName;
  next.productStatus = "pending_review";
  next.adminNote = "";
  next.featured = false;
  next.trending = false;
  next.bestseller = false;
  return next;
}

export const sellerMe = asyncHandler(async (req, res) => {
  const profile =
    req.user!.role === "admin"
      ? {
          id: "admin",
          userId: req.user!.id,
          requestId: null,
          businessName: "The Grim Store Admin",
          ownerName: req.user!.name || "Admin",
          email: req.user!.email,
          phone: req.user!.phone,
          city: "",
          pincode: "",
          category: "Marketplace",
          gstNumber: "",
          website: "",
          status: "active"
        }
      : await getActiveSellerProfile(req.user!.id);
  if (req.user!.role !== "admin" && !profile) throw new ApiError(403, "Approved seller profile required");
  const stats = profile
    ? await row<{
        total: number;
        active: number;
        pending: number;
        rejected: number;
      }>(
        `SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE product_status = 'active')::int AS active,
          COUNT(*) FILTER (WHERE product_status = 'pending_review')::int AS pending,
          COUNT(*) FILTER (WHERE product_status = 'rejected')::int AS rejected
        FROM products ${req.user!.role === "admin" ? "WHERE seller_id IS NOT NULL" : "WHERE seller_id = :sellerId"}`,
        { sellerId: profile.userId }
      )
    : { total: 0, active: 0, pending: 0, rejected: 0 };

  res.json({ success: true, profile, stats });
});

export const listSellerProducts = asyncHandler(async (req, res) => {
  if (req.user!.role === "admin") {
    const products = await rows("SELECT * FROM products WHERE seller_id IS NOT NULL ORDER BY updated_at DESC");
    return res.json({ success: true, products: products.map(mapProduct) });
  }
  const profile = await requireSellerProfile(req.user!.id);
  const products = await rows("SELECT * FROM products WHERE seller_id = :sellerId ORDER BY updated_at DESC", { sellerId: profile.userId });
  res.json({ success: true, products: products.map(mapProduct) });
});

export const createSellerProduct = asyncHandler(async (req, res) => {
  const profile = await requireSellerProfile(req.user!.id);
  const body = prepareProductBody(req.body, profile);
  const productId = id();
  await apiCache.clear();
  await execute(
    `INSERT INTO products (
      id, title, slug, description, short_description, brand, category_id, subcategory_id, gender, tags,
      price, sale_price, discount_percentage, stock, sku, colors, sizes, images, featured, trending,
      bestseller, seo_title, seo_description, meta_keywords, rating_distribution, variants, summary,
      description_html, care_instructions, size_chart, delivery_info, return_policy,
      seller_id, seller_name, product_status, admin_note
    ) VALUES (
      :id, :title, :slug, :description, :shortDescription, :brand, :category, :subCategory, :gender, :tags,
      :price, :salePrice, :discountPercentage, :stock, :sku, :colors, :sizes, :images, FALSE, FALSE,
      FALSE, :seoTitle, :seoDescription, :metaKeywords, :ratingDistribution, :variants, :summary,
      :descriptionHtml, :careInstructions, :sizeChart, :deliveryInfo, :returnPolicy,
      :sellerId, :sellerName, :productStatus, :adminNote
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

export const updateSellerProduct = asyncHandler(async (req, res) => {
  const profile = await requireSellerProfile(req.user!.id);
  const existing = mapProduct(await row("SELECT * FROM products WHERE id = :id AND seller_id = :sellerId", { id: req.params.id, sellerId: profile.userId }));
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.productStatus === "inactive") throw new ApiError(400, "Inactive products cannot be edited");

  const next = prepareProductBody(req.body, profile, existing);
  await apiCache.clear();
  await execute(
    `UPDATE products SET title=:title, slug=:slug, description=:description, short_description=:shortDescription,
      brand=:brand, category_id=:category, subcategory_id=:subCategory, gender=:gender, tags=:tags,
      price=:price, sale_price=:salePrice, discount_percentage=:discountPercentage, stock=:stock, sku=:sku,
      colors=:colors, sizes=:sizes, images=:images, featured=FALSE, trending=FALSE, bestseller=FALSE,
      seo_title=:seoTitle, seo_description=:seoDescription, meta_keywords=:metaKeywords, variants=:variants,
      summary=:summary, description_html=:descriptionHtml, care_instructions=:careInstructions,
      size_chart=:sizeChart, delivery_info=:deliveryInfo, return_policy=:returnPolicy,
      seller_name=:sellerName, product_status='pending_review', admin_note='', updated_at=CURRENT_TIMESTAMP
     WHERE id=:id AND seller_id=:sellerId`,
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
  res.json({ success: true, product });
});

export const archiveSellerProduct = asyncHandler(async (req, res) => {
  const profile = await requireSellerProfile(req.user!.id);
  const product = mapProduct(await row("SELECT * FROM products WHERE id = :id AND seller_id = :sellerId", { id: req.params.id, sellerId: profile.userId }));
  if (!product) throw new ApiError(404, "Product not found");
  await apiCache.clear();
  if (["draft", "pending_review", "rejected"].includes(product.productStatus)) {
    await execute("DELETE FROM products WHERE id = :id AND seller_id = :sellerId", { id: req.params.id, sellerId: profile.userId });
    return res.json({ success: true, archived: false, deleted: true });
  }

  await execute(
    "UPDATE products SET product_status = 'inactive', admin_note = 'Seller requested removal', updated_at = CURRENT_TIMESTAMP WHERE id = :id AND seller_id = :sellerId",
    { id: req.params.id, sellerId: profile.userId }
  );
  res.json({ success: true, archived: true, deleted: false });
});

export const listSellerOrders = asyncHandler(async (req, res) => {
  const profile = req.user!.role === "admin" ? null : await requireSellerProfile(req.user!.id);
  await execute(
    `UPDATE orders
     SET payment_status = 'failed', order_status = 'cancelled', tracking_status = 'Payment not completed', updated_at = CURRENT_TIMESTAMP
     WHERE payment_status = 'pending'
       AND COALESCE(payment_info ->> 'method', '') = 'razorpay'
       AND created_at < NOW() - ('30 minutes')::interval`
  );
  const allOrders = (await rows(`SELECT * FROM orders WHERE ${VISIBLE_ORDER_SQL} ORDER BY created_at DESC`)).map(mapOrder);
  const orders = allOrders
    .map((order: any) => ({
      ...order,
      products: (order.products ?? []).filter((item: any) => (profile ? item.sellerId === profile.userId : Boolean(item.sellerId)))
    }))
    .filter((order: any) => order.products.length > 0);
  res.json({ success: true, orders });
});
