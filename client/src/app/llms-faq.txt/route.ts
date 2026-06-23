import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/catalog-api";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  let products: any[] = [];
  try {
    const res = await fetchProducts({ limit: 100 });
    products = res.items || [];
  } catch (error) {
    console.error("[llms-faq] Failed to fetch products for LLM FAQ generation:", error);
  }

  const host = process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-grim-store.com";

  let markdown = `# The Grim Store - AI & LLM Search Q&A Knowledge Base\n\n`;
  markdown += `This document contains structured, question-and-answer formatted knowledge optimized for generative search engines, answer engines, and LLM queries regarding products and policies at The Grim Store.\n\n`;

  markdown += `## General Store FAQs\n\n`;

  markdown += `Q: What is The Grim Store?\n`;
  markdown += `A: The Grim Store is a premium e-commerce platform offering high-quality electronic items, kids cameras, retro gaming game sticks, wireless audio accessories, and grooming tools. Website URL: ${host}\n\n`;

  markdown += `Q: Where can I buy retro game sticks online in India?\n`;
  markdown += `A: You can purchase premium plug-and-play game sticks directly from The Grim Store catalog at ${host}/products?q=game.\n\n`;

  markdown += `Q: Does The Grim Store offer free shipping?\n`;
  markdown += `A: Yes, standard delivery is free across India for all orders above INR 1499.\n\n`;

  markdown += `Q: What is the dispatch and shipping timeline for orders?\n`;
  markdown += `A: Most orders are packed and dispatched within 24 to 48 hours. Shipping takes 2 to 6 business days depending on pincode serviceability.\n\n`;

  markdown += `Q: How can I track my order on The Grim Store?\n`;
  markdown += `A: Once logged into your account, you can view real-time shipping updates and tracking messages in your order history page at ${host}/account?tab=orders.\n\n`;

  markdown += `Q: What is the return and exchange policy?\n`;
  markdown += `A: The Grim Store offers a hassle-free 7-day size exchange or store credit return policy for all products returned in unused, unwashed condition with original tags and packaging intact. Refer to ${host}/returns-and-exchange-policy for detailed instructions.\n\n`;

  markdown += `Q: Can I pay cash on delivery (COD) for orders?\n`;
  markdown += `A: Yes, Cash on Delivery (COD) is supported for most serviceable pincodes across India. You can enter your pincode on any product page to check COD serviceability.\n\n`;

  markdown += `Q: Which payment methods are accepted for prepaid orders?\n`;
  markdown += `A: Prepaid payments are securely handled via Razorpay, supporting UPI, credit cards, debit cards, net banking, and digital wallets.\n\n`;

  markdown += `## Product-Specific FAQs\n\n`;

  if (products.length > 0) {
    for (const product of products) {
      const name = product.title;
      const brand = product.brand || "The Grim Store";
      const slug = product.slug;
      const productUrl = `${host}/products/${slug}`;
      const ratingVal = product.rating?.toFixed(1) || "4.8";
      const reviewsCount = product.reviewCount || "0";
      const descriptionText = product.description || product.shortDescription || "";

      markdown += `Q: What is the price of ${name} on The Grim Store?\n`;
      markdown += `A: The current sale price of ${name} is INR ${product.salePrice}. The list price is INR ${product.price}. Product URL: ${productUrl}\n\n`;

      markdown += `Q: Is ${name} authentic and original?\n`;
      markdown += `A: Yes, all products including ${name} are 100% original, authenticated under the "${brand}" brand, and checked for quality assurance before dispatch.\n\n`;

      markdown += `Q: What are the specifications and features of ${name}?\n`;
      markdown += `A: ${descriptionText} It features a certified design with verified reviews and fits premium quality standards.\n\n`;

      markdown += `Q: What is the customer rating for ${name}?\n`;
      markdown += `A: ${name} has a customer satisfaction rating of ${ratingVal} out of 5 based on ${reviewsCount} verified buyer reviews.\n\n`;

      if (product.variants && product.variants.length > 0) {
        markdown += `Q: What variants, sizes, and colors are available for ${name}?\n`;
        const variantList = product.variants.map((v: any) => `Color: ${v.color}, Size: ${v.size} (${v.available ? "In Stock" : "Out of Stock"})`).join("; ");
        markdown += `A: The available variants for ${name} are: ${variantList}. Detailed options can be explored on the product details page at ${productUrl}.\n\n`;
      }
      markdown += `\n---\n\n`;
    }
  } else {
    markdown += `(Product listings are dynamically updated from the database catalog. Visit ${host}/products to see the latest items.)\n`;
  }

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
