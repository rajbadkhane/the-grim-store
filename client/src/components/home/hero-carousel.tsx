"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HeroCarousel() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Image
        priority
        src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=85"
        alt="Premium streetwear editorial"
        fill
        sizes="100vw"
        className="object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/10" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-red-400">Limited summer drop</p>
          <h1 className="mt-4 text-5xl font-black leading-none sm:text-7xl lg:text-8xl">The Grim Store</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
            Premium black and red streetwear built for expressive shoppers, fast discovery, verified reviews, and a checkout that does not get in the way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-red-600 px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(225,29,46,0.25)] hover:bg-red-500">
              Shop new drops <ArrowRight size={18} />
            </Link>
            <Link href="/products?sort=popular" className="inline-flex min-h-11 items-center rounded-md border border-white/15 px-5 text-sm font-bold hover:bg-white/10">
              View bestsellers
            </Link>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-y border-white/10 bg-black/60 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 text-xs font-bold uppercase tracking-widest text-white/70 sm:grid-cols-4">
          <span>COD ready</span>
          <span>Verified reviews</span>
          <span>Fast dispatch</span>
          <span>Secure checkout</span>
        </div>
      </div>
    </section>
  );
}
