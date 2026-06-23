import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, CreditCard, Truck, Users, Star, ArrowRight, Gamepad2, Laptop, Headphones, Watch, Sparkles } from "lucide-react";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { ProductCardFigma } from "@/components/product-card-figma";
import { formatMoney } from "@/lib/utils";
import { organizationJsonLd, websiteJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { HomepageClient } from "./page-client";

export const metadata: Metadata = {
  title: "The Grim Store | Electronic Items, Kids Cameras & Game Sticks",
  description: "Shop kids instant cameras, game sticks, wireless audio, grooming tools, and electronic accessories from The Grim Store.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Grim Store | Electronic Items, Kids Cameras & Game Sticks",
    description: "Electronic items, kids cameras, game sticks, wireless audio, grooming tools, and accessories.",
    url: "/",
    siteName: "The Grim Store",
    type: "website"
  }
};

export default async function HomePage() {
  const [{ items: products, total }, categories] = await Promise.all([
    fetchProducts({ limit: 40 }),
    fetchCategories()
  ]);

  // Curate products strictly using non-overlapping slices of the 21 products in the database
  const finalTrending = products.slice(0, 4);
  const finalKids = products.slice(4, 8);
  const finalGaming = products.slice(8, 12);
  const finalSmart = products.slice(12, 16);
  const finalBestsellers = products.slice(16);

  // Highlight products for floating cards in Hero
  const heroToy = finalKids[0];
  const heroGame = finalGaming[0];
  const heroSmart = finalSmart[0];

  const testimonials = [
    {
      name: "Rohit Sharma",
      role: "Parent",
      rating: 5,
      comment: "The kids camera quality was better than expected, packaging was neat, and delivery was fast.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Aanya Patel",
      role: "Tech Enthusiast",
      rating: 5,
      comment: "Bought wireless audio from the catalog. The product photos and pricing made the choice easy.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Vikram Malhotra",
      role: "Gamer",
      rating: 5,
      comment: "The Grim Store has become my default shop for small electronics and game accessories. Secure payments and order updates are a big plus.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
    }
  ];

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is The Grim Store?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Grim Store is a premium e-commerce platform offering high-quality electronic items, kids cameras, retro gaming game sticks, wireless audio accessories, and grooming tools."
        }
      },
      {
        "@type": "Question",
        "name": "Does The Grim Store offer free shipping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, standard delivery is free across India for all orders above INR 1499."
        }
      },
      {
        "@type": "Question",
        "name": "What is the return and exchange policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a hassle-free 7-day size exchange or store credit return policy for all products returned in unused, unwashed condition with original tags intact."
        }
      },
      {
        "@type": "Question",
        "name": "How can I track my order status?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once logged into your account, you can view real-time shipping updates and tracking messages in your order history page under My Orders."
        }
      }
    ]
  };

  return (
    <main className="mobile-bottom-safe bg-[#f9f9f9] text-[#1a1c1c] transition-colors dark:bg-[#0A0A0A] dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd("Trending Products", finalTrending)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }} />
      
      {/* Client-side animations and layouts wrapper */}
      <HomepageClient 
        heroToy={heroToy}
        heroGame={heroGame}
        heroSmart={heroSmart}
        finalKids={finalKids}
        finalGaming={finalGaming}
        finalSmart={finalSmart}
        finalTrending={finalTrending}
        finalBestsellers={finalBestsellers}
        testimonials={testimonials}
        totalProducts={total || products.length}
      />

    </main>
  );
}
