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
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Max Price</span>
        <span className="font-black text-blue-200">Rs. {val}</span>
      </div>
      <input
        type="range"
        min="499"
        max="5999"
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="mt-3 w-full cursor-pointer accent-blue-500"
      />
      <button
        type="submit"
        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.045] py-2.5 text-xs font-black text-slate-100 transition hover:border-blue-300/60 hover:bg-blue-500/10 hover:text-white hover:shadow-[0_0_26px_rgba(59,130,246,0.2)]"
      >
        Apply Price Limit
      </button>
    </form>
  );
}
