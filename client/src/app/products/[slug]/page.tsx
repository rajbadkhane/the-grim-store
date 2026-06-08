import { notFound } from "next/navigation";
import { fetchProduct, fetchProductReviews } from "@/lib/catalog-api";
import { productJsonLd, productMetadata } from "@/lib/seo";
import { ProductDetailClient } from "./product-detail-client";
import { ReviewPanel } from "./review-panel";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  return product ? productMetadata(product) : {};
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();
  const reviews = await fetchProductReviews(product.id);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, reviews)) }} />
      <ProductDetailClient product={product} />
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <ReviewPanel product={product} initialReviews={reviews} />
      </div>
    </>
  );
}
