import { sitePages } from "@/lib/site-pages";

export const dynamic = "force-static";

export function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const lines = [
    "# The Grim Store",
    "",
    "The Grim Store is a premium electronics ecommerce storefront for oversized tees, hoodies, limited drops, verified reviews, account orders, returns, refunds, shipping, and secure checkout.",
    "",
    "## Primary Public Pages",
    `- Home: ${base}/`,
    `- Products: ${base}/products`,
    "",
    "## Customer Help And Policy Pages",
    ...sitePages.map((page) => `- ${page.title}: ${base}/${page.slug} - ${page.description}`),
    "",
    "## Machine-Readable Feeds",
    `- Sitemap: ${base}/sitemap.xml`,
    `- Robots: ${base}/robots.txt`,
    "",
    "## Indexing Notes",
    "- Product and public information pages are intended for search indexing.",
    "- Account, cart, checkout, wishlist, and admin pages are private utility surfaces and are marked noindex.",
    "- Product pages include Product, Offer, Review, AggregateRating when available, and BreadcrumbList structured data."
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
