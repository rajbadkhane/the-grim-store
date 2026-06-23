import { notFound } from "next/navigation";
import { fetchProduct, fetchProductReviews } from "@/lib/catalog-api";
import { productJsonLd, productMetadata, productFaqJsonLd } from "@/lib/seo";
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
    <div className="pb-40 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, reviews)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productFaqJsonLd(product)) }} />
      <ProductDetailClient product={product} />
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <ReviewPanel product={product} initialReviews={reviews} />
      </div>
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <ProductFaqSection product={product} />
      </div>
    </div>
  );
}

function ProductFaqSection({ product }: { product: any }) {
  const brandName = product.brand || "The Grim Store";
  const name = product.title;
  const cat = product.category || "electronic item";

  const faqs = [
    {
      q: `What is ${name}?`,
      a: `${name} is a premium ${cat} by ${brandName}. ${product.shortDescription || product.description || ""}`
    },
    {
      q: `Who is ${name} for?`,
      a: `${name} is designed for buyers looking for useful function, reliable build quality, and clear everyday value.`
    },
    {
      q: `Why should I buy ${name}?`,
      a: `Buying ${name} gives you verified catalog details, customer reviews, secure checkout, and return/refund protection backed by The Grim Store.`
    }
  ];

  return (
    <section className="border-t border-neutral-200/50 dark:border-neutral-800/80 pt-10">
      <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider mb-6">Frequently Asked Questions</h2>
      <div className="grid gap-4">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 p-5 shadow-xs">
            <h3 className="text-sm font-heading font-extrabold text-neutral-850 dark:text-white uppercase tracking-wide">{faq.q}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-650 dark:text-slate-400 font-semibold">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
