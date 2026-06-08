"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PriceFilter({ currentMax }: { currentMax?: string }) {
  const [val, setVal] = useState(Number(currentMax ?? "5999"));
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (currentMax) {
      setVal(Number(currentMax));
    }
  }, [currentMax]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("max", String(val));
    nextParams.delete("page");
    router.push(`/products?${nextParams.toString()}`);
  };

  return (
    <form onSubmit={handleApply} className="mt-5">
      <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-white/60">
        <span>Max Price</span>
        <span className="font-black text-red-600 dark:text-red-400">Rs. {val}</span>
      </div>
      <input
        type="range"
        min="499"
        max="5999"
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="mt-3 w-full cursor-pointer accent-red-600"
      />
      <button
        type="submit"
        className="mt-3 w-full rounded-md border border-neutral-200 bg-white py-2.5 text-xs font-black text-neutral-800 transition hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-600 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-red-500/10 dark:hover:text-red-300"
      >
        Apply Price Limit
      </button>
    </form>
  );
}
