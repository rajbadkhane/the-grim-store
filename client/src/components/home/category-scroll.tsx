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
              className="group flex aspect-square w-[96px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-[#282c3f]/10 bg-white p-3 text-center shadow-xs transition-all duration-300 hover:scale-[1.03] hover:border-[#FF3B30] hover:shadow-md dark:border-white/5 dark:bg-[#171010] dark:hover:border-[#FF3B30] sm:w-[112px]"
            >
              <Icon
                size={26}
                className="text-neutral-700 transition-colors duration-200 group-hover:text-[#FF3B30] dark:text-neutral-300"
              />
              <span className="mt-2.5 text-[9px] font-black uppercase tracking-wider text-neutral-850 transition-colors duration-200 group-hover:text-[#FF3B30] dark:text-neutral-300">
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
