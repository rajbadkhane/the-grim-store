import type { Metadata } from "next";

export function siteUrl(path = "/") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thegrimstore.com").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function productMetadata(product: { title: string; description: string; slug: string; image: string; seoTitle?: string; seoDescription?: string }): Metadata {
  const title = product.seoTitle || product.title;
  const description = product.seoDescription || product.description;
  const url = siteUrl(`/products/${product.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      title,
      description,
      url,
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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl("/#organization"),
    name: "The Grim Store",
    url: siteUrl("/"),
    logo: siteUrl("/logo.png"),
    description: "Electronic items, kids cameras, game sticks, wireless audio, grooming tools, and accessories from The Grim Store.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9999999999",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: "en"
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "MG Road",
      addressLocality: "Indore",
      addressRegion: "MP",
      postalCode: "452001",
      addressCountry: "IN"
    },
    sameAs: [
      "https://facebook.com/thegrimstore",
      "https://instagram.com/thegrimstore",
      "https://twitter.com/thegrimstore"
    ]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteUrl("/#website"),
    name: "The Grim Store",
    url: siteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl("/products")}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: siteUrl(crumb.url)
    }))
  };
}

export function collectionPageJsonLd(categoryName: string, products: any[]) {
  const listItems = products.slice(0, 20).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: siteUrl(`/products/${product.slug}`),
    name: product.title,
    image: product.image || product.images?.[0]
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryName,
    url: siteUrl(`/products?category=${categoryName.toLowerCase().replace(/\s+/g, "-")}`),
    description: `Shop the best premium selection of ${categoryName} at The Grim Store. Check verified ratings, availability, and exclusive offers.`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: listItems
    }
  };
}

export function cartPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shopping Cart | The Grim Store",
    description: "Review and edit items in your shopping cart before checking out at The Grim Store.",
    url: siteUrl("/cart"),
    publisher: {
      "@type": "Organization",
      name: "The Grim Store",
      logo: {
        "@type": "ImageObject",
        url: siteUrl("/logo.png")
      }
    }
  };
}

export function checkoutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CheckoutPage",
    name: "Checkout | The Grim Store",
    description: "Complete your order securely using Razorpay UPI, Cards, or Cash on Delivery at The Grim Store.",
    url: siteUrl("/checkout"),
    publisher: {
      "@type": "Organization",
      name: "The Grim Store",
      logo: {
        "@type": "ImageObject",
        url: siteUrl("/logo.png")
      }
    }
  };
}

export function productFaqJsonLd(product: any) {
  const brandName = product.brand || "The Grim Store";
  const name = product.title;
  const cat = product.category || "catalog product";
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${name} is a premium ${cat} by ${brandName}. ${product.shortDescription || product.description || ""}`
        }
      },
      {
        "@type": "Question",
        "name": `Who is ${name} for?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${name} is designed for buyers looking for high-quality construction, distinctive styling, and dependable everyday utility.`
        }
      },
      {
        "@type": "Question",
        "name": `Why should someone buy ${name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Buy ${name} to get industry-leading build quality, verified user reviews, and comprehensive return/refund protection backed by The Grim Store.`
        }
      }
    ]
  };
}
