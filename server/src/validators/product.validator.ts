import { z } from "zod";

const image = z.object({ url: z.string().url(), alt: z.string().min(2), publicId: z.string().optional() });
const variant = z.object({
  color: z.string().min(1),
  colorHex: z.string().optional(),
  size: z.string().min(1),
  material: z.string().optional(),
  pattern: z.string().optional(),
  sku: z.string().min(1),
  stock: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  images: z.array(image).default([]),
  available: z.boolean().default(true)
});

export const productSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    slug: z.string().min(2).optional(),
    description: z.string().min(3),
    shortDescription: z.string().optional(),
    brand: z.string().min(1),
    category: z.string().min(1),
    subCategory: z.string().optional(),
    gender: z.enum(["men", "women", "unisex", "kids"]).default("unisex"),
    tags: z.array(z.string()).default([]),
    price: z.number().nonnegative(),
    salePrice: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    sku: z.string().min(2),
    colors: z.array(z.object({ name: z.string(), hex: z.string() })).default([]),
    sizes: z.array(z.object({ label: z.string(), stock: z.number().int().nonnegative() })).default([]),
    images: z.array(image).default([]),
    variants: z.array(variant).default([]),
    summary: z.array(z.object({ title: z.string().optional(), text: z.string().min(1), icon: z.string().optional() })).default([]),
    descriptionHtml: z.string().optional(),
    careInstructions: z.array(z.string()).default([]),
    sizeChart: z.array(z.record(z.string(), z.string())).default([]),
    deliveryInfo: z.record(z.string(), z.any()).default({}),
    returnPolicy: z.string().optional(),
    featured: z.boolean().default(false),
    trending: z.boolean().default(false),
    bestseller: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).default([])
  })
});

export const productQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    gender: z.string().optional(),
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    sort: z.enum(["latest", "price-asc", "price-desc", "rating", "popular"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12)
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export const productSuggestionQuerySchema = z.object({
  query: z.object({
    q: z.string().max(120).optional(),
    limit: z.coerce.number().int().positive().max(8).default(6)
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});
