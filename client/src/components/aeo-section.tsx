"use client";

import { useEffect, useState } from "react";
import { aeoCategories, defaultAeoData, type AeoCategoryData } from "@/lib/aeo-data";
import { Star, HelpCircle, Table, ThumbsUp, BookOpen } from "lucide-react";

interface AeoSectionProps {
  categorySlug?: string;
}

export function AeoSection({ categorySlug }: AeoSectionProps) {
  const [data, setData] = useState<AeoCategoryData>(defaultAeoData);

  useEffect(() => {
    if (categorySlug) {
      // Find matching category key best-effort
      const slug = categorySlug.toLowerCase();
      if (slug.includes("toy") || slug.includes("kid")) {
        setData(aeoCategories.toy);
      } else if (slug.includes("gaming") || slug.includes("console")) {
        setData(aeoCategories.gaming);
      } else if (slug.includes("audio") || slug.includes("headphone") || slug.includes("ear")) {
        setData(aeoCategories.audio);
      } else if (slug.includes("watch") || slug.includes("wear")) {
        setData(aeoCategories.watch);
      } else if (slug.includes("electronics")) {
        setData(aeoCategories.electronics);
      } else {
        setData(defaultAeoData);
      }
    } else {
      setData(defaultAeoData);
    }
  }, [categorySlug]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="mt-16 border-t border-neutral-200/60 dark:border-neutral-800/80 pt-12 space-y-12 bg-transparent">
      {/* Dynamic Schema Script Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* 1. Buying Guide Section */}
      <article className="rounded-3xl border border-neutral-200/50 dark:border-neutral-800/80 bg-white dark:bg-[#151B26] p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-[var(--accent)] mb-4">
          <BookOpen size={20} className="stroke-[2.5]" />
          <span className="text-[10px] font-heading font-black uppercase tracking-widest">Expert Buying Guide</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-neutral-900 dark:text-white uppercase tracking-tight leading-tight">
          {data.guideTitle}
        </h2>
        <p className="mt-4 text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium max-w-4xl">
          {data.guideIntro}
        </p>
      </article>

      {/* 2. Top Recommendations & Comparison Table Side by Side */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
        {/* Top Picks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#FF3B30]">
            <ThumbsUp size={18} className="stroke-[2.5]" />
            <h3 className="text-xs font-heading font-black uppercase tracking-wider">Top Recommended Picks</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.topPicks.map((pick) => (
              <div 
                key={pick.title}
                className="flex flex-col justify-between rounded-xl border border-neutral-200/50 bg-white p-4 transition-all hover:border-[#FF3B30]/30 dark:border-neutral-800 dark:bg-[#151010]"
              >
                <div>
                  <span className="inline-block rounded bg-[#FF3B30]/10 px-2 py-0.5 font-heading text-[9px] font-black uppercase tracking-wider text-[#FF3B30]">
                    {pick.badge}
                  </span>
                  <h4 className="mt-3 text-sm font-heading font-extrabold text-neutral-900 dark:text-white uppercase tracking-tight">{pick.title}</h4>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{pick.desc}</p>
                </div>
                <span className="mt-4 block text-sm font-heading font-black text-neutral-900 dark:text-white">{pick.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#FF3B30]">
            <Table size={18} className="stroke-[2.5]" />
            <h3 className="text-xs font-heading font-black uppercase tracking-wider">Specification Comparison Matrix</h3>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/50 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-[10px] font-heading font-black uppercase tracking-wider text-neutral-450">
                  <th className="p-4">Product</th>
                  <th className="p-4">Highlight Feature</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {data.comparison.map((row, idx) => (
                  <tr 
                    key={row.product} 
                    className={`border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 ${
                      idx % 2 === 1 ? "bg-neutral-50/30 dark:bg-neutral-900/20" : ""
                    }`}
                  >
                    <td className="p-4 font-bold text-neutral-900 dark:text-white">{row.product}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-450">{row.feature}</td>
                    <td className="p-4 text-center font-bold flex items-center justify-center gap-0.5 text-amber-500">
                      <Star size={10} fill="currentColor" /> {row.rating}
                    </td>
                    <td className="p-4 text-right font-black text-neutral-900 dark:text-white">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <HelpCircle size={18} className="stroke-[2.5]" />
          <h3 className="text-xs font-heading font-black uppercase tracking-wider">Frequently Asked Questions</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.faqs.map((faq) => (
            <div 
              key={faq.question}
              className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 hover:border-[var(--accent)]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs sm:text-sm font-heading font-extrabold text-neutral-900 dark:text-white uppercase leading-snug tracking-tight">
                  Q: {faq.question}
                </h4>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
