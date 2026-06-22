"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Truck, Star, ArrowRight, Gamepad2, Headphones, Watch, ToyBrick, Smartphone, Zap, Sparkles, ChevronRight } from "lucide-react";
import { ProductCardFigma } from "@/components/product-card-figma";
import { formatMoney } from "@/lib/utils";

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
};

type HomepageClientProps = {
  heroToy: any;
  heroGame: any;
  heroSmart: any;
  finalKids: any[];
  finalGaming: any[];
  finalSmart: any[];
  finalTrending: any[];
  finalBestsellers: any[];
  testimonials: Testimonial[];
  totalProducts: number;
};

export function HomepageClient({
  heroToy,
  heroGame,
  heroSmart,
  finalKids,
  finalGaming,
  finalSmart,
  finalTrending,
  finalBestsellers,
  testimonials,
  totalProducts
}: HomepageClientProps) {
  
  const bentoCollections = [
    {
      title: "Kids Toys",
      desc: "Smart robotics, interactive Lego-style educational blocks, and creative play kits.",
      href: "/products?q=toy",
      badge: "Educational",
      productCount: "24 Products",
      bgClass: "bg-[#FFF1EB] dark:bg-[#2D160E] border-[#FF6B35]/25 dark:border-[#FF6B35]/15",
      icon: ToyBrick,
      iconColor: "text-[#FF6B35]",
      image: heroToy?.image,
      size: "col-span-1"
    },
    {
      title: "Gaming Zone",
      desc: "Consoles, ergonomic gamepads, and retro gaming boards.",
      href: "/products?q=gaming",
      badge: "Pro Gaming",
      productCount: "18 Products",
      bgClass: "bg-[#F4E8FF] dark:bg-[#1E112C] border-purple-500/25 dark:border-purple-500/15",
      icon: Gamepad2,
      iconColor: "text-purple-500",
      image: heroGame?.image,
      size: "col-span-1"
    },
    {
      title: "Audio Gear",
      desc: "ANC headsets, earbuds, and premium sound systems.",
      href: "/products?q=audio",
      badge: "High Fidelity",
      productCount: "32 Products",
      bgClass: "bg-[#EAF4FF] dark:bg-[#101D2C] border-blue-500/25 dark:border-blue-500/15",
      icon: Headphones,
      iconColor: "text-blue-500",
      image: heroSmart?.image,
      size: "col-span-1"
    },
    {
      title: "Wearables",
      desc: "Active lifestyle smartwatches and fitness trackers.",
      href: "/products?q=watch",
      badge: "Smart Life",
      productCount: "15 Products",
      bgClass: "bg-[#FFF8D8] dark:bg-[#2C2610] border-[#FFD93D]/30 dark:border-[#FFD93D]/15",
      icon: Watch,
      iconColor: "text-[#FFD93D] dark:text-[#FBBF24]",
      image: heroSmart?.image,
      size: "col-span-1"
    },
    {
      title: "Electronics",
      desc: "Phones, tablets, laptops, and everyday productivity gear.",
      href: "/products?q=electronics",
      badge: "Essential",
      productCount: "28 Products",
      bgClass: "bg-[#F5F5F5] dark:bg-[#191919] border-neutral-300/35 dark:border-neutral-800/40 md:col-span-2",
      icon: Smartphone,
      iconColor: "text-neutral-600 dark:text-neutral-350",
      image: heroGame?.image,
      size: "col-span-1 md:col-span-2"
    }
  ];

  return (
    <div className="space-y-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 sm:pt-8">
      
      {/* 1. Hero Section (Height Compacted to 500px-600px Max on Mobile) */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200/50 dark:border-neutral-800 hero-premium-bg p-5 sm:p-8 md:p-12 lg:p-16 max-h-none sm:max-h-none">
        
        {/* Soft Ambient Background Grid */}
        <div className="absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none mix-blend-overlay bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)]" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/10 px-3.5 py-1 text-xs font-bold text-[#FF6B35]"
            >
              <Sparkles size={12} /> Modern Tech For Smart Families
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="mt-4 text-[32px] sm:text-[54px] md:text-[68px] lg:text-[88px] font-heading font-extrabold tracking-[-0.04em] leading-[1.0] text-[#0F172A] dark:text-white"
            >
              Play.<br />
              Learn.<br />
              <span className="text-[#FF6B35]">Explore.</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="mt-4 space-y-2"
            >
              <h3 className="text-sm sm:text-base md:text-[17px] font-heading font-extrabold text-[#0F172A] dark:text-white leading-tight uppercase tracking-wide">
                Smart Toys, Gaming Gadgets & Family Electronics.
              </h3>
              <p className="max-w-lg text-xs sm:text-[15px] font-medium leading-relaxed text-slate-700 dark:text-slate-350">
                Discover educational toys, gaming gear, audio products and smart gadgets curated for kids and families.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-3.5 items-center"
            >
              {/* Primary CTA (Shop Now) - Strictly formatted to match guidelines */}
              <Link 
                href="/products" 
                className="inline-flex h-[52px] items-center justify-center rounded-[16px] bg-[#0F172A] text-[#FFFFFF] px-8 text-[16px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-98 cursor-pointer"
              >
                Shop Now →
              </Link>
              <Link href="/products?sort=popular" className="inline-flex h-[52px] items-center justify-center rounded-[16px] border border-[#0F172A] dark:border-white text-[#0F172A] dark:text-white bg-transparent px-8 text-[16px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0F172A]/10 dark:hover:bg-white/10 active:scale-98 cursor-pointer">
                Explore Collections
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-6 hidden sm:flex items-center gap-1.5 text-[10px] font-heading font-bold text-slate-650 dark:text-slate-400 uppercase tracking-widest"
            >
              <span>⭐⭐⭐⭐⭐</span>
              <span>Trusted by Thousands of Families</span>
            </motion.div>
          </div>

          {/* Floating Product Cards (Desktop only) */}
          <div className="relative hidden lg:flex min-h-[380px] w-full items-center justify-center">
            {/* Ambient Blur Backdrop */}
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#FF6B35]/20 to-[#FFD93D]/20 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md flex items-center justify-center">
              
              {/* Card 1: Console (Gamer) - Left overlap - Desktop width: 240px */}
              {heroGame && (
                <motion.div 
                  animate={{ y: [0, -12, 0], rotate: [-6, -4, -6], scale: [1, 1.01, 1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-[-20px] md:left-0 w-[240px] rounded-[20px] border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-0"
                >
                  <div className="relative w-full aspect-[4/5] rounded-[16px] bg-[#FAFAFA] dark:bg-neutral-855 overflow-hidden">
                    <Image src={heroGame.image} alt={heroGame.title} fill className="object-contain p-3" priority />
                  </div>
                  <div className="mt-3">
                    <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Gaming Console</span>
                    <h4 className="text-[11px] font-extrabold truncate text-[#0F172A] dark:text-white mt-0.5">{heroGame.title}</h4>
                  </div>
                </motion.div>
              )}

              {/* Card 2: Educational Toy (Kids) - Centered focused card - Desktop width: 280px */}
              {heroToy && (
                <motion.div 
                  animate={{ y: [-15, -30, -15], rotate: [0, 2, 0], scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[280px] rounded-[20px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-10 translate-y-[-15px] translate-x-[10px] md:translate-x-0"
                >
                  <div className="relative w-full aspect-[4/5] rounded-[16px] bg-[#FAFAFA] dark:bg-neutral-855 overflow-hidden">
                    <Image src={heroToy.image} alt={heroToy.title} fill className="object-contain p-3.5" priority />
                  </div>
                  <div className="mt-3.5">
                    <span className="text-[9px] font-bold text-[#FF6B35] uppercase tracking-wider">Kids Smart Toy</span>
                    <h4 className="text-[12px] font-extrabold text-[#0F172A] dark:text-white mt-0.5 truncate">{heroToy.title}</h4>
                    <span className="text-[11px] font-heading font-black text-[#0F172A] dark:text-neutral-200 mt-1 block">{formatMoney(heroToy.salePrice)}</span>
                  </div>
                </motion.div>
              )}

              {/* Card 3: Wearable (Electronics) - Right overlap - Desktop width: 240px */}
              {heroSmart && (
                <motion.div 
                  animate={{ y: [25, 15, 25], rotate: [8, 10, 8], scale: [1, 1.01, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-[-20px] md:right-0 w-[240px] rounded-[20px] border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-0 translate-y-[25px]"
                >
                  <div className="relative w-full aspect-[4/5] rounded-[16px] bg-[#FAFAFA] dark:bg-neutral-855 overflow-hidden">
                    <Image src={heroSmart.image} alt={heroSmart.title} fill className="object-contain p-3" priority />
                  </div>
                  <div className="mt-3">
                    <span className="text-[9px] font-bold text-[#FFD93D] uppercase tracking-wider">Wearables</span>
                    <h4 className="text-[11px] font-extrabold truncate text-[#0F172A] dark:text-white mt-0.5">{heroSmart.title}</h4>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 2. Trending Products (Issue 7: Products placed earlier for faster discovery) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200/40 dark:border-neutral-800/60 pb-4 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Trending Products</h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-medium">High demand products running on active promotional pricing</p>
          </div>
          <Link href="/products?sort=popular" className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] uppercase tracking-widest font-heading transition">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {finalTrending.map((product) => (
            <ProductCardFigma key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Featured Collections Redesign (Issue 5 Typography & Issue 10/11 Card image layout) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-tight leading-[1.0] mb-2">Featured Collections</h2>
          <p className="text-[15px] text-slate-750 dark:text-slate-200 font-medium leading-relaxed">Browse our core inventory groups in interactive grid layouts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {bentoCollections.map((col) => {
            const Icon = col.icon;
            return (
              <Link 
                href={col.href} 
                key={col.title}
                className={`relative rounded-[24px] border p-6 md:p-8 flex flex-col sm:flex-row justify-between gap-6 group cursor-pointer bg-white dark:bg-[#151B26] border-neutral-200/50 dark:border-neutral-800/80 shadow-xs hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 ${col.size}`}
              >
                {/* Left content panel */}
                <div className="flex-1 flex flex-col justify-between min-h-[150px] z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`grid h-8 w-8 place-items-center rounded-lg bg-neutral-50 dark:bg-neutral-900 shadow-sm ${col.iconColor}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-850 dark:text-neutral-200">
                        {col.badge}
                      </span>
                    </div>
                    <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#FF6B35]">
                      {col.productCount}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-tight leading-tight mt-1">
                      {col.title}
                    </h3>
                    <p className="text-[15px] text-slate-650 dark:text-slate-350 mt-2 font-medium leading-relaxed max-w-[240px]">
                      {col.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-heading font-black uppercase tracking-widest text-[#0F172A] dark:text-white">
                    <span>Explore</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>

                {/* Right content panel (Centered cover image occupying 60-70% width, no stretching/crops) */}
                {col.image && (
                  <div className="relative w-full sm:w-[60%] aspect-[4/3] rounded-2xl overflow-hidden shadow-xs pointer-events-none self-center bg-neutral-50 dark:bg-neutral-900/40">
                    <Image 
                      src={col.image} 
                      alt={col.title} 
                      fill 
                      sizes="(max-width: 640px) 100vw, 40vw"
                      className="object-contain p-3.5 group-hover:scale-[1.03] transition-transform duration-300 origin-center w-full h-full"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers (Originally New Arrivals, placed earlier for faster discovery) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200/40 dark:border-neutral-800/60 pb-4 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Best Sellers</h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-medium">Top selling smart consoles, wearables, and family gadgets</p>
          </div>
          <Link href="/products?sort=popular" className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] uppercase tracking-widest font-heading transition">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {finalBestsellers.map((product) => (
            <ProductCardFigma key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Collections (Remaining Category Listings) */}
      <div className="space-y-16 pt-4">
        {/* Kids Favorites */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200/40 dark:border-neutral-800/60 pb-4 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Kids Favorites</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-medium">Smart toys, robotics, and interactive educational tech</p>
            </div>
            <Link href="/products?q=toy" className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] uppercase tracking-widest font-heading transition">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {finalKids.map((product) => (
              <ProductCardFigma key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Gaming Collection */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200/40 dark:border-neutral-800/60 pb-4 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Gaming Collection</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-medium">Next-gen consoles, mechanical gear, and gaming accessories</p>
            </div>
            <Link href="/products?q=gaming" className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] uppercase tracking-widest font-heading transition">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {finalGaming.map((product) => (
              <ProductCardFigma key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Audio Collection */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200/40 dark:border-neutral-800/60 pb-4 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Audio Collection</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-medium">ANC headsets, wireless earbuds, and premium stereos</p>
            </div>
            <Link href="/products?q=audio" className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] uppercase tracking-widest font-heading transition">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {finalSmart.map((product) => (
              <ProductCardFigma key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>

      {/* 6. Why Choose Us */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Why Modern Families Choose Us</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-semibold uppercase tracking-wider">Enterprise logistics backing every single order</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [CreditCard, "Prepaid & Cash-on-Delivery", "Secure Razorpay processing for credit cards, UPI, net banking, or choose hassle-free COD."],
            [Truck, "Instant Dispatch Tracking", "Once confirmed, your order status shifts instantly with Shiprocket timeline codes linked in your account."],
            [ShieldCheck, "100% Assured Catalog", "All toys, audio headsets, and smart consoles undergo rigorous checks before shipment."]
          ].map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof ShieldCheck;
            return (
              <div 
                key={title as string} 
                className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 p-6 flex flex-col hover:border-[#FF6B35]/30 hover:shadow-xs transition-all"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                  <IconComponent size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="mt-4 text-xs font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">{title as string}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-350 font-semibold">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Customer Reviews */}
      <section className="space-y-6 pb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-heading font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider leading-none">Reviewed By The Community</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-2 font-semibold uppercase tracking-wider">Read testimonials from real parents and gadget buyers</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 text-[#FFD93D]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-[#FFD93D] text-[#FFD93D]" />
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-neutral-900 dark:text-white">{t.name}</h4>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-350 font-bold uppercase tracking-wider">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
