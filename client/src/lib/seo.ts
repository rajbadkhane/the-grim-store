import type { Metadata } from "next";

export function siteUrl(path = "/") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function productMetadata(product: { title: string; description: string; slug: string; image: string; seoTitle?: string; seoDescription?: string }): Metadata {
  const title = product.seoTitle || product.title;
  const description = product.seoDescription || product.description;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      title,
      description,
      url: `/products/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
      type: "website"
    },
    twitter: { card: "summary_large_image", title, description, images: product.image ? [product.image] : [] }
  };
}

export function productJsonLd(product: any, reviews: any[] = []) {
  const productImages = product.images?.length ? product.images : product.image ? [product.image] : [];
  const availability = product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const productUrl = siteUrl(`/products/${product.slug}`);
  const hasReviews = Number(product.reviewCount || 0) > 0 && Number(product.rating || 0) > 0;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      image: productImages,
      description: product.seoDescription || product.description,
      brand: { "@type": "Brand", name: product.brand },
      sku: product.variants?.[0]?.sku || product.slug,
      ...(hasReviews
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount
            }
          }
        : {}),
      review: reviews.slice(0, 10).map((review) => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.userName || "Verified buyer" },
        datePublished: review.createdAt,
        reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
        name: review.title,
        reviewBody: review.comment
      })),
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: product.salePrice,
        availability,
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "The Grim Store" }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Products", item: siteUrl("/products") },
        { "@type": "ListItem", position: 3, name: product.title, item: productUrl }
      ]
    }
  ];
}

export function storefrontJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The Grim Store",
      url: siteUrl("/"),
      sameAs: [] as string[]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The Grim Store",
      url: siteUrl("/"),
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl("/products")}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ];
}
