import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/catalog-api";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const { items: products } = await fetchProducts({ limit: 100 });

  let markdown = `# The Grim Store - Full Product Catalog & Policies\n\n`;
  markdown += `This document provides the complete details of all products, specifications, pricing, inventory, and policies at The Grim Store.\n\n`;

  markdown += `## Store Policies\n\n`;
  markdown += `### Shipping & Delivery\n`;
  markdown += `- Standard delivery is free for orders above INR 1499.\n`;
  markdown += `- Most orders are dispatched within 24-48 hours.\n`;
  markdown += `- Delivery times vary between 2-6 business days depending on pincode serviceability.\n\n`;
  
  markdown += `### Returns & Exchange\n`;
  markdown += `- Easy 7-day size exchange or store credit return policy for all products in unused, unwashed condition with tags intact.\n\n`;

  markdown += `## Product Catalog\n\n`;

  for (const product of products) {
    markdown += `### ${product.title}\n`;
    markdown += `- **ID / SKU**: \`${product.id}\`\n`;
    markdown += `- **Brand**: ${product.brand || "The Grim Store"}\n`;
    markdown += `- **Category**: ${product.category || "General"}\n`;
    markdown += `- **Price**: INR ${product.price}\n`;
    markdown += `- **Sale Price**: INR ${product.salePrice}\n`;
    markdown += `- **Rating**: ${product.rating.toFixed(1)}/5 (${product.reviewCount} ratings)\n`;
    markdown += `- **Stock**: ${product.stock} units available\n`;
    markdown += `- **Description**: ${product.description || product.shortDescription || ""}\n`;
    
    if (product.variants && product.variants.length > 0) {
      markdown += `- **Variants**:\n`;
      for (const v of product.variants) {
        markdown += `  - SKU: \`${v.sku}\` | Color: ${v.color} | Size: ${v.size} | Price: INR ${v.salePrice} | Stock: ${v.stock} | ${v.available ? "In Stock" : "Out of Stock"}\n`;
      }
    }

    if (product.careInstructions && product.careInstructions.length > 0) {
      markdown += `- **Care Instructions**:\n`;
      for (const inst of product.careInstructions) {
        markdown += `  - ${inst}\n`;
      }
    }

    markdown += `- **Return Policy**: ${product.returnPolicy || "7-day size exchange or store credit returns."}\n`;
    markdown += `- **Delivery Info**: ${product.deliveryInfo?.text || "Standard shipping (3-6 business days)."}\n`;
    markdown += `\n---\n\n`;
  }

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
