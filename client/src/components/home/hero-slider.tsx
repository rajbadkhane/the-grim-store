"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Smartphone, Gamepad2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StoreProduct } from "@/lib/catalog-api";

const SLIDES = [
  {
    id: 1,
    title: "Latest Gadgets",
    heading: "Fresh deals are live",
    link: "/products",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=700&q=80",
    bg: "bg-black",
    icon: Smartphone,
    brandText: "The Grim Store"
  },
  {
    id: 2,
    title: "Gaming Essentials",
    heading: "Shop real inventory",
    link: "/products",
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=700&q=80",
    bg: "bg-neutral-950",
    icon: Gamepad2,
    brandText: "The Grim Store"
  },
  {
    id: 3,
    title: "New Arrivals",
    heading: "Browse the catalog",
    link: "/products",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
    bg: "bg-neutral-900",
    icon: Sparkles,
    brandText: "The Grim Store"
  }
];

export function HeroSlider({ products = [] }: { products?: StoreProduct[] }) {
  const [current, setCurrent] = useState(0);
  const slides = products.length
    ? products.map((product, index) => ({
        id: product.id,
        title: product.title,
        heading: product.price > product.salePrice ? `Save ₹${Math.round(product.price - product.salePrice)}` : "New in store",
        link: `/products/${product.slug}`,
        image: product.image,
        bg: index % 2 === 0 ? "bg-black" : "bg-neutral-950",
        icon: index % 2 === 0 ? Smartphone : Gamepad2,
        brandText: product.brand || "The Grim Store"
      }))
    : SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] ?? slides[0];
  const IconComp = slide.icon;

  return (
    <div className={`relative h-[290px] w-full overflow-hidden rounded-md ${slide.bg} border border-white/5 sm:h-[340px]`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-8 md:flex-row"
        >
          {/* Text Left */}
          <div className="flex flex-col items-start justify-center text-white max-w-md z-10">
            <div className="flex items-center gap-3">
              <IconComp size={18} className="text-[#FF3B30]" />
              <span className="text-xs font-semibold tracking-wider text-white/80">{slide.brandText}</span>
            </div>
            
            <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
              {slide.heading}
            </h2>

            <Link
              href={slide.link}
              className="mt-5 inline-flex items-center gap-2 border-b-2 border-white/40 pb-1 text-xs font-black transition-all duration-200 hover:border-[#FF3B30] hover:text-[#FF3B30]"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Image Right */}
          <div className="relative mt-4 flex h-[170px] w-full items-center justify-center md:mt-0 md:h-full md:w-1/2">
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent z-10 md:hidden" />
            <div className="relative h-full max-h-[260px] w-full aspect-video md:aspect-square">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain md:object-cover rounded-md opacity-85"
                priority
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots (Absolute Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === current ? "bg-[#FF3B30] scale-125 shadow-md shadow-[#FF3B30]/50" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
