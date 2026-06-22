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
      <div className="flex items-center justify-between text-sm text-neutral-450">
        <span>Max Price</span>
        <span className="font-black text-electrox-blue">Rs. {val}</span>
      </div>
      <input
        type="range"
        min="499"
        max="5999"
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="mt-3 w-full cursor-pointer accent-blue-500"
        style={{ caretColor: "transparent" }}
      />
      <button
        type="submit"
        className="mt-3 w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-2.5 text-xs font-black text-foreground hover:border-electrox-blue hover:bg-electrox-surface"
      >
        Apply Price Limit
      </button>
    </form>
  );
}
