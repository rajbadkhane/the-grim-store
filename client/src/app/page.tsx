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
  title: "The Grim Store | Premium Smart Toys, Gaming Gear & Family Electronics",
  description: "Shop high-end kids smart toys, pro gaming gear, audio equipment, and family wearables. Fast shipping and verified customer reviews.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Grim Store | Premium Smart Toys, Gaming Gear & Family Electronics",
    description: "Premium kids smart toys, educational gadgets, gaming consoles, wearables, and electronics designed for modern families.",
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
  const finalSmart = products.slice(12, 16); // Audio Collection
  const finalBestsellers = products.slice(16); // New Arrivals

  // Highlight products for floating cards in Hero
  const heroToy = finalKids[0];
  const heroGame = finalGaming[0];
  const heroSmart = finalSmart[0];

  const testimonials = [
    {
      name: "Rohit Sharma",
      role: "Parent",
      rating: 5,
      comment: "The educational smart toys are amazing! My daughter loves the interactive learning sets. Premium quality and super fast delivery.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Aanya Patel",
      role: "Tech Enthusiast",
      rating: 5,
      comment: "Bought the wireless gaming headset. Sound is crystal clear, latency is zero. The website experience feels extremely premium.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Vikram Malhotra",
      role: "Gamer",
      rating: 5,
      comment: "The Grim Store has become my default shop for gaming gear and wearables. Fully secure Razorpay payments and reliable timeline updates.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
    }
  ];

  return (
    <main className="mobile-bottom-safe bg-[#FAFAFA] dark:bg-[#0B0F19] transition-colors pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd("Trending Products", finalTrending)) }} />
      
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
