import * as XLSX from "xlsx";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { makeSlug } from "../helpers/slug.js";
import { execute, id, json, row, rows } from "../lib/sql.js";

/* ------------------------------------------------------------------ */
/*  Column map: maps friendly Excel header names → internal keys      */
/* ------------------------------------------------------------------ */
const COLUMN_MAP: Record<string, string> = {
  title: "title",
  "product title": "title",
  "product name": "title",
  name: "title",
  slug: "slug",
  brand: "brand",
  sku: "sku",
  category: "category",
  "category name": "category",
  subcategory: "subCategory",
  "sub category": "subCategory",
  gender: "gender",
  price: "price",
  mrp: "price",
  "sale price": "salePrice",
  saleprice: "salePrice",
  "selling price": "salePrice",
  stock: "stock",
  quantity: "stock",
  description: "description",
  "short description": "shortDescription",
  shortdescription: "shortDescription",
  tags: "tags",
  colors: "colors",
  sizes: "sizes",
  featured: "featured",
  trending: "trending",
  bestseller: "bestseller",
  "image url": "imageUrl",
  "image urls": "imageUrl",
  imageurl: "imageUrl",
  images: "imageUrl",
  "seo title": "seoTitle",
  seotitle: "seoTitle",
  "seo description": "seoDescription",
  seodescription: "seoDescription",
  "delivery text": "deliveryText",
  "return policy": "returnPolicy",
  material: "material",
  pattern: "pattern",
  "color hex": "colorHex",
  colorhex: "colorHex",
};

/* ------------------------------------------------------------------ */
/*  GET /products/bulk-import/template   – return expected columns     */
/* ------------------------------------------------------------------ */
export const getImportTemplate = asyncHandler(async (_req, res) => {
  const wb = XLSX.utils.book_new();
  const templateHeaders = [
    "Title",
    "SKU",
    "Brand",
    "Category",
    "Gender",
    "Price",
    "Sale Price",
    "Stock",
    "Description",
    "Short Description",
    "Tags",
    "Colors",
    "Color Hex",
    "Sizes",
    "Material",
    "Pattern",
    "Image URLs",
    "Featured",
    "Trending",
    "Bestseller",
    "SEO Title",
    "SEO Description",
    "Delivery Text",
    "Return Policy",
  ];
  const sampleRow = [
    "Grim Oversized Tee",
    "GRM-OVR-001",
    "Grim Originals",
    "T-Shirts",
    "unisex",
    1299,
    999,
    50,
    "Premium oversized cotton tee with streetwear finish.",
    "Grim oversized tee — bio-washed cotton.",
    "oversized, streetwear, cotton",
    "Black, White",
    "#111111, #FFFFFF",
    "S, M, L, XL",
    "Premium cotton",
    "Solid",
    "https://example.com/img1.jpg, https://example.com/img2.jpg",
    "TRUE",
    "FALSE",
    "TRUE",
    "Grim Oversized Tee – Buy Online",
    "Shop premium oversized tees from Grim Store.",
    "Free delivery above INR 1499. Standard delivery 3-6 business days.",
    "Easy 7-day exchange for size issues on unused products.",
  ];
  const ws = XLSX.utils.aoa_to_sheet([templateHeaders, sampleRow]);

  /* auto-width */
  ws["!cols"] = templateHeaders.map((h) => ({ wch: Math.max(h.length + 4, 18) }));

  XLSX.utils.book_append_sheet(wb, ws, "Products");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", 'attachment; filename="product_import_template.xlsx"');
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
});

/* ------------------------------------------------------------------ */
/*  POST /products/bulk-import   – parse & insert products from Excel */
/* ------------------------------------------------------------------ */
export const bulkImportProducts = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw new ApiError(400, "No file uploaded. Please upload an .xlsx or .csv file.");

  /* Parse the workbook */
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(file.buffer, { type: "buffer" });
  } catch {
    throw new ApiError(400, "Unable to parse the uploaded file. Make sure it is a valid .xlsx or .csv.");
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new ApiError(400, "The uploaded file has no sheets.");

  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (!rawRows.length) throw new ApiError(400, "The uploaded file has no data rows.");

  /* Pre-load categories for name→id lookup */
  const allCategories = await rows("SELECT id, name, slug FROM categories");
  const categoryMap = new Map<string, string>();
  for (const cat of allCategories) {
    categoryMap.set(cat.name.toLowerCase(), cat.id);
    categoryMap.set(cat.slug.toLowerCase(), cat.id);
  }

  const results: {
    row: number;
    title: string;
    status: "success" | "error";
    message: string;
  }[] = [];

  let successCount = 0;
  let errorCount = 0;
  let autoSkuCounter = 1;

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    const rowNum = i + 2; // Excel row number (1-indexed header + data)

    try {
      /* Normalize column names */
      const mapped: Record<string, unknown> = {};
      for (const [header, value] of Object.entries(rawRow)) {
        const key = COLUMN_MAP[header.toLowerCase().trim()] ?? header.toLowerCase().trim();
        mapped[key] = value;
      }

      /* Required field checks */
      const title = String(mapped.title ?? "").trim();
      if (!title) {
        results.push({ row: rowNum, title: "", status: "error", message: "Title is required." });
        errorCount++;
        continue;
      }

      let sku = String(mapped.sku ?? "").trim();
      const skuMatch = sku.match(/^GRM-OVR-(\d+)$/i);
      if (skuMatch) autoSkuCounter = Math.max(autoSkuCounter, Number(skuMatch[1]) + 1);

      if (!sku) {
        do {
          sku = `GRM-OVR-${String(autoSkuCounter++).padStart(3, "0")}`;
        } while (await row("SELECT id FROM products WHERE sku = :sku", { sku }));
      }

      /* Check duplicate SKU */
      const existingSku = await row("SELECT id FROM products WHERE sku = :sku", { sku });
      if (existingSku) {
        results.push({ row: rowNum, title, status: "error", message: `SKU "${sku}" already exists. Skipped.` });
        errorCount++;
        continue;
      }

      const price = Number(mapped.price) || 0;
      const salePrice = Number(mapped.salePrice) || price;
      const stock = Number(mapped.stock) || 0;

      if (price <= 0) {
        results.push({ row: rowNum, title, status: "error", message: "Price must be greater than 0." });
        errorCount++;
        continue;
      }

      /* Category resolution */
      const categoryInput = String(mapped.category ?? "").trim();
      let categoryId: string | null = null;
      if (categoryInput) {
        categoryId = categoryMap.get(categoryInput.toLowerCase()) ?? null;
        if (!categoryId) {
          /* Auto-create the category */
          categoryId = id();
          const slug = makeSlug(categoryInput);
          await execute("INSERT INTO categories (id, name, slug) VALUES (:id, :name, :slug)", { id: categoryId, name: categoryInput, slug });
          categoryMap.set(categoryInput.toLowerCase(), categoryId);
          categoryMap.set(slug, categoryId);
        }
      }
      if (!categoryId) {
        results.push({ row: rowNum, title, status: "error", message: "Category is required." });
        errorCount++;
        continue;
      }

      /* Parse comma-separated values */
      const parseCsv = (val: unknown): string[] =>
        String(val ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const tagList = parseCsv(mapped.tags);
      const colorNames = parseCsv(mapped.colors);
      const colorHexes = parseCsv(mapped.colorHex);
      const sizeLabels = parseCsv(mapped.sizes);
      const imageUrls = parseCsv(mapped.imageUrl);
      const material = String(mapped.material ?? "").trim();
      const pattern = String(mapped.pattern ?? "").trim();

      const slug = mapped.slug ? makeSlug(String(mapped.slug)) : makeSlug(title);
      const brand = String(mapped.brand ?? "").trim() || "Grim Originals";
      const gender = (["men", "women", "unisex", "kids"].includes(String(mapped.gender ?? "").toLowerCase()) ? String(mapped.gender).toLowerCase() : "unisex");
      const description = String(mapped.description ?? title).trim();
      const shortDescription = String(mapped.shortDescription ?? "").trim();
      const discountPercentage = price > 0 ? Math.round(((price - salePrice) / price) * 100) : 0;

      const isTruthy = (val: unknown) => ["true", "1", "yes", "TRUE", "Yes"].includes(String(val).trim());

      const colors = colorNames.map((name, idx) => ({ name, hex: colorHexes[idx] || "#111111" }));
      const sizes = sizeLabels.map((label) => ({ label, stock: Math.ceil(stock / sizeLabels.length) }));
      const images = imageUrls.map((url) => ({ url, alt: `${title} product image` }));

      /* Build variants from color×size matrix */
      const variants: any[] = [];
      if (colorNames.length && sizeLabels.length) {
        for (const color of colorNames) {
          const hex = colorHexes[colorNames.indexOf(color)] || "#111111";
          for (const size of sizeLabels) {
            variants.push({
              color,
              colorHex: hex,
              size,
              material: material || "Premium cotton",
              pattern: pattern || "Solid",
              sku: `${sku}-${color}-${size}`.replace(/\s+/g, "-").toUpperCase(),
              stock: Math.ceil(stock / (colorNames.length * sizeLabels.length)),
              price,
              salePrice,
              images,
              available: true,
            });
          }
        }
      } else if (colorNames.length) {
        for (const color of colorNames) {
          const hex = colorHexes[colorNames.indexOf(color)] || "#111111";
          variants.push({
            color,
            colorHex: hex,
            size: "Free Size",
            material: material || "Premium cotton",
            pattern: pattern || "Solid",
            sku: `${sku}-${color}`.replace(/\s+/g, "-").toUpperCase(),
            stock: Math.ceil(stock / colorNames.length),
            price,
            salePrice,
            images,
            available: true,
          });
        }
      } else {
        variants.push({
          color: "Default",
          colorHex: "#111111",
          size: sizeLabels[0] || "Free Size",
          material: material || "Premium cotton",
          pattern: pattern || "Solid",
          sku,
          stock,
          price,
          salePrice,
          images,
          available: true,
        });
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
          title,
          slug,
          description,
          shortDescription,
          brand,
          category: categoryId,
          subCategory: null,
          gender,
          tags: json(tagList),
          price,
          salePrice,
          discountPercentage,
          stock,
          sku,
          colors: json(colors),
          sizes: json(sizes),
          images: json(images),
          featured: isTruthy(mapped.featured),
          trending: isTruthy(mapped.trending),
          bestseller: isTruthy(mapped.bestseller),
          seoTitle: String(mapped.seoTitle ?? title).trim(),
          seoDescription: String(mapped.seoDescription ?? (shortDescription || description)).trim(),
          metaKeywords: json(tagList),
          ratingDistribution: json({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
          variants: json(variants),
          summary: json([{ text: shortDescription || description }]),
          descriptionHtml: null,
          careInstructions: json(["Machine wash cold", "Do not bleach", "Dry inside out"]),
          sizeChart: json(
            sizeLabels.length
              ? sizeLabels.map((s) => ({ Size: s, Chest: "-", Length: "-" }))
              : [
                  { Size: "S", Chest: "38 in", Length: "27 in" },
                  { Size: "M", Chest: "40 in", Length: "28 in" },
                  { Size: "L", Chest: "42 in", Length: "29 in" },
                  { Size: "XL", Chest: "44 in", Length: "30 in" },
                ]
          ),
          deliveryInfo: json({ text: String(mapped.deliveryText ?? "Free delivery above INR 1499. Standard delivery usually takes 3-6 business days.").trim() }),
          returnPolicy: String(mapped.returnPolicy ?? "Easy 7-day exchange for size issues on unused products with original tags.").trim(),
        }
      );

      results.push({ row: rowNum, title, status: "success", message: "Product created." });
      successCount++;
    } catch (err: any) {
      results.push({
        row: rowNum,
        title: String((rawRow as any).Title ?? (rawRow as any).title ?? ""),
        status: "error",
        message: err.message ?? "Unknown error",
      });
      errorCount++;
    }
  }

  res.status(201).json({
    success: true,
    total: rawRows.length,
    successCount,
    errorCount,
    results,
  });
});
