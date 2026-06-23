import { NextResponse } from "next/server";

export async function GET() {
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-grim-store.com";
  
  const markdown = `# The Grim Store

> A premium, modern e-commerce platform for electronic items, kids cameras, game sticks, wireless audio, grooming tools, and everyday accessories.

## Links
- [Full Product Catalog & Store Policies](${host}/llms-full.txt): Comprehensive, structured markdown dump of all 21 products, variants, specs, and logistics policies.
- [AI Search Q&A Base](${host}/llms-faq.txt): Structured question-and-answer formatted catalog content optimized for generative answer engines (AEO/GEO).
- [All Products Catalog](${host}/products): Dynamic catalog index featuring search, filter by price, colors, and category.
- [Terms & Conditions](${host}/terms-and-conditions): Store usage rules, account responsibilities, and legal agreements.
- [Returns & Exchange Policy](${host}/returns-and-exchange-policy): Details on size exchanges, return eligibility, and quality inspection rules.
- [Shipping & Delivery Policy](${host}/shipping-policy): Coverage, shipping charges, delivery times, and dispatch tracking details.
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
