import { NextResponse } from "next/server";

export async function GET() {
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-grim-store.com";
  
  const markdown = `# The Grim Store

> A premium, modern e-commerce platform specializing in Smart Toys, Educational Gadgets, Gaming Consoles, Wearables, and Audio Products. Built with premium Lego, Apple, and Nothing design vibes.

## Links
- [Full Product Catalog & Store Policies](${host}/llms-full.txt): Comprehensive, structured markdown dump of all 21 products, variants, specs, and logistics policies.
- [All Products Catalog](${host}/products): Dynamic catalog index featuring search, filter by price, colors, and category.
- [Terms & Return Policy](${host}/policies): Specific terms governing returns, shipping timelines, and exchange conditions.
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
