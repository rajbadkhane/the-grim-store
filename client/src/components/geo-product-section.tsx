"use client";

import { useState } from "react";
import type { StoreProduct } from "@/lib/catalog-api";
import { Sparkles, HelpCircle, ThumbsUp, Layers, CheckCircle2, AlertCircle } from "lucide-react";

interface GeoProductSectionProps {
  product: StoreProduct;
}

export function GeoProductSection({ product }: GeoProductSectionProps) {
  const brand = product.brand || "The Grim Store";
  const name = product.title;
  const category = (product.category || "item").toLowerCase();

  const useCaseTitle = "Ideal Use Cases";
  const useCaseText = "Built for everyday styling, limited-drop collecting, gifting, and reliable daily utility.";
  const whoForText = "Perfect for buyers who want distinctive products, dependable checkout, and direct store support.";

  return (
    <div className="mt-8 space-y-6">
      {/* 1. Core Discoverability Q&A */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 shadow-xs">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
            <Sparkles size={14} /> What is it?
          </h3>
          <p className="mt-2 text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
            {name} is a high-grade, durable {category} curated by {brand}. It pairs practical construction with a sharp black-and-red store aesthetic.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 shadow-xs">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#FF3B30] flex items-center gap-1.5">
            <HelpCircle size={14} /> Who is it for?
          </h3>
          <p className="mt-2 text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
            {whoForText}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 shadow-xs">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#FF3B30] flex items-center gap-1.5">
            <ThumbsUp size={14} /> Why buy it?
          </h3>
          <p className="mt-2 text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
            It features a verified average rating of {product.rating.toFixed(1)}/5 stars and is covered by our direct 7-day hassle-free exchange protection.
          </p>
        </div>
      </section>

      {/* 2. Structured Benefits & Use Cases Grid */}
      <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent)] stroke-[2.5]" /> Benefits & Core Value
          </h3>
          <div className="grid gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-350 font-semibold">
            <div className="flex gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-red-500 mt-0.5" />
              <p><strong className="text-foreground">Durable Build:</strong> Selected for repeat use, daily handling, and dependable finishing.</p>
            </div>
            <div className="flex gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-red-500 mt-0.5" />
              <p><strong className="text-foreground">On-Brand Finish:</strong> Clean presentation, accurate variants, and product details matching direct specifications.</p>
            </div>
            <div className="flex gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-red-500 mt-0.5" />
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
            <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[var(--accent)] block">Alternatives Comparison:</span>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Standard local market alternatives often lack tracking numbers and verified reviews. The Grim Store provides immediate Shiprocket verification and secure payment options.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pros and Cons List */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-red-500/10 dark:border-red-500/10 bg-red-500/[0.02] dark:bg-red-500/[0.02] p-5">
          <h4 className="text-xs font-heading font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Product Pros
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-350 font-semibold leading-normal list-disc pl-4">
            <li>Durable materials that withstand continuous usage</li>
            <li>Sharp black-and-red presentation with practical everyday utility</li>
            <li>Verified ratings backed by organic customer community feedback</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/10 dark:border-rose-500/5 bg-rose-500/[0.02] dark:bg-rose-500/[0.01] p-5">
          <h4 className="text-xs font-heading font-black uppercase tracking-wider text-rose-600 dark:text-rose-450 flex items-center gap-1.5">
            <AlertCircle size={14} /> Product Cons
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-350 font-semibold leading-normal list-disc pl-4">
            <li>Strict limited stock count can lead to quick sell-outs</li>
            <li>Premium construction can command slightly higher price points</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
