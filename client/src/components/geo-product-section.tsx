"use client";

import { useState } from "react";
import type { StoreProduct } from "@/lib/catalog-api";
import { Sparkles, HelpCircle, ThumbsUp, Layers, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface GeoProductSectionProps {
  product: StoreProduct;
}

export function GeoProductSection({ product }: GeoProductSectionProps) {
  const brand = product.brand || "The Grim Store";
  const name = product.title;
  const category = (product.category || "item").toLowerCase();

  // Categorize use cases based on product tags/category
  const isToy = name.toLowerCase().includes("toy") || category.includes("toy");
  const isGaming = name.toLowerCase().includes("game") || name.toLowerCase().includes("console") || category.includes("gaming");
  const isAudio = category.includes("audio") || name.toLowerCase().includes("headphone") || name.toLowerCase().includes("earbud");

  let useCaseTitle = "Ideal Use Cases";
  let useCaseText = "Great for everyday family convenience, active lifestyle usage, and home tech settings.";
  let whoForText = "Perfect for modern families, tech collectors, and buyers seeking reliable performance.";

  if (isToy) {
    useCaseTitle = "STEM & Learning Use Cases";
    useCaseText = "Perfect for classroom group activities, parent-child early STEM coaching, and interactive solo play sessions.";
    whoForText = "Designed for children aged 3-12, homeschooling parents, and educators looking for quality STEM material.";
  } else if (isGaming) {
    useCaseTitle = "Leisure & Gaming Use Cases";
    useCaseText = "Ideal for casual gaming rooms, competitive online matches, and portable offline travel entertainment.";
    whoForText = "Perfect for competitive esports players, retro console collectors, and tech-savvy teens.";
  } else if (isAudio) {
    useCaseTitle = "High-Fidelity Audio Use Cases";
    useCaseText = "Ideal for remote work video calls, noise-free travel commutes, and deep focus study/workout sessions.";
    whoForText = "Perfect for remote professionals, audiophiles, students, and daily commuters.";
  }

  return (
    <div className="mt-8 space-y-6">
      {/* 1. Core Discoverability Q&A */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 shadow-xs">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#FF6B35] flex items-center gap-1.5">
            <Sparkles size={14} /> What is it?
          </h3>
          <p className="mt-2 text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
            {name} is a high-grade, durable {category} engineered by {brand}. It integrates seamless craftsmanship with certified family safety features.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 shadow-xs">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
            <HelpCircle size={14} /> Who is it for?
          </h3>
          <p className="mt-2 text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
            {whoForText}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 shadow-xs">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
            <ThumbsUp size={14} /> Why buy it?
          </h3>
          <p className="mt-2 text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
            Unlike cheap template clones, it features a verified average rating of {product.rating.toFixed(1)}/5 stars and is covered by our direct 7-day hassle-free exchange protection.
          </p>
        </div>
      </section>

      {/* 2. Structured Benefits & Use Cases Grid */}
      <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Layers size={16} className="text-[#FF6B35] stroke-[2.5]" /> Benefits & Core Value
          </h3>
          <div className="grid gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-350 font-semibold">
            <div className="flex gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
              <p><strong className="text-foreground">Durable Formulation:</strong> Designed using premium non-toxic components, certified safe for daily handling.</p>
            </div>
            <div className="flex gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
              <p><strong className="text-foreground">On-Brand Finish:</strong> Standardized structural colorways and sizes matching direct specifications.</p>
            </div>
            <div className="flex gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
              <p><strong className="text-foreground">Tested Parameters:</strong> Fully audited logistics dispatch ensuring the parcel matches catalog expectations.</p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-foreground">
            {useCaseTitle}
          </h3>
          <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-300 font-semibold">
            {useCaseText}
          </p>
          <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
            <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#FF6B35] block">Alternatives Comparison:</span>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Standard local market alternatives often lack tracking numbers and verified reviews. The Grim Store provides immediate Shiprocket verification and secure payment options.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pros and Cons List */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] p-5">
          <h4 className="text-xs font-heading font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Product Pros
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-350 font-semibold leading-normal list-disc pl-4">
            <li>Durable materials that withstand continuous usage</li>
            <li>Premium design aesthetics incorporating Apple/Nintendo vibes</li>
            <li>Verified ratings backed by organic customer community feedback</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/10 dark:border-rose-500/5 bg-rose-500/[0.02] dark:bg-rose-500/[0.01] p-5">
          <h4 className="text-xs font-heading font-black uppercase tracking-wider text-rose-600 dark:text-rose-450 flex items-center gap-1.5">
            <AlertCircle size={14} /> Product Cons
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-350 font-semibold leading-normal list-disc pl-4">
            <li>Strict limited stock count can lead to quick sell-outs</li>
            <li>Premium formulation command slightly higher price points</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
