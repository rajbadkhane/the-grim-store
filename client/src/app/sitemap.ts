import type { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { sitePages } from "@/lib/site-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [{ items: products }, categories] = await Promise.all([fetchProducts({ limit: 500 }), fetchCategories()]);
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((category) => ({
      url: `${base}/products?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85
    })),
    ...sitePages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(page.lastUpdated),
      changeFrequency: "monthly" as const,
      priority: page.slug === "privacy-policy" || page.slug === "terms-and-conditions" ? 0.7 : 0.75
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
