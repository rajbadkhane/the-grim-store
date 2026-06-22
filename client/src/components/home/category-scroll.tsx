"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Smartphone, Headphones, Gamepad2, Watch, Laptop, Cable } from "lucide-react";

const iconMap = {
  Smartphone,
  Headphones,
  Gamepad2,
  Watch,
  Laptop,
  Cable
};

type CategoryItem = {
  label: string;
  href: string;
  iconName: string;
};

export function CategoryScroll({ categories }: { categories: CategoryItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 240;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group/scroll mt-8 px-1">
      {/* Left chevron button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white shadow-md border border-neutral-200/50 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all z-20 opacity-0 group-hover/scroll:opacity-100 hidden md:flex cursor-pointer items-center justify-center"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Scrolling container */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-snap-x pb-3 px-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map(({ label, href, iconName }) => {
          const Icon = iconMap[iconName as keyof typeof iconMap] || Smartphone;
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center justify-center shrink-0 w-[110px] sm:w-[130px] aspect-square rounded-2xl bg-white dark:bg-[#1a1c1e] border border-[#282c3f]/10 dark:border-white/5 hover:border-blue-600 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 shadow-xs hover:shadow-md group cursor-pointer text-center p-3"
            >
              <Icon
                size={26}
                className="text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 transition-colors duration-200"
              />
              <span className="mt-3 text-[10px] font-black uppercase tracking-wider text-neutral-850 dark:text-neutral-300 group-hover:text-blue-600 transition-colors duration-200">
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Right chevron button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white shadow-md border border-neutral-200/50 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all z-20 opacity-0 group-hover/scroll:opacity-100 hidden md:flex cursor-pointer items-center justify-center"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
