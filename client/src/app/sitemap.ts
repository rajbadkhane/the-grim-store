import type { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { sitePages } from "@/lib/site-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thegrimstore.com";
  
  let products: any[] = [];
  let categories: any[] = [];
  
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetchProducts({ limit: 500 }),
      fetchCategories()
    ]);
    products = productsRes?.items || [];
    categories = categoriesRes || [];
  } catch (error) {
    console.warn("[sitemap] Failed to fetch sitemap data from API during build. Falling back to static pages.");
  }

  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 }
  ];

  if (categories && categories.length > 0) {
    categories.forEach((category) => {
      routes.push({
        url: `${base}/products?category=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.85
      });
    });
  }

  if (sitePages && sitePages.length > 0) {
    sitePages.forEach((page) => {
      routes.push({
        url: `${base}/${page.slug}`,
        lastModified: new Date(page.lastUpdated),
        changeFrequency: "monthly",
        priority: page.slug === "privacy-policy" || page.slug === "terms-and-conditions" ? 0.7 : 0.75
      });
    });
  }

  if (products && products.length > 0) {
    products.forEach((product) => {
      routes.push({
        url: `${base}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8
      });
    });
  }

  return routes;
}
