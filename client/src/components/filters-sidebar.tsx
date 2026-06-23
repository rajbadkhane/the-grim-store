"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Search, Star } from "lucide-react";
import { StoreCategory } from "@/lib/catalog-api";
import { formatMoney } from "@/lib/utils";

interface FiltersSidebarProps {
  categories: StoreCategory[];
  brands: string[];
  currentParams: Record<string, string | undefined>;
}

export function FiltersSidebar({ categories, brands, currentParams }: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    price: true,
    ratings: true,
    materials: true,
    availability: true,
  });

  // Local brand search query
  const [brandSearch, setBrandSearch] = useState("");

  // Local price value state (to prevent laggy slides updating URL on every drag)
  const [maxPrice, setMaxPrice] = useState(Number(currentParams.max ?? "5999"));

  useEffect(() => {
    if (currentParams.max) {
      setMaxPrice(Number(currentParams.max));
    }
  }, [currentParams.max]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    nextParams.delete("page");
    router.push(`/products?${nextParams.toString()}`);
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("max", String(maxPrice));
  };

  // Filter brands locally
  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Category Section */}
      <div className="border-b border-electrox-elevated pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between py-2 text-left font-bold text-sm text-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span>CATEGORIES</span>
          {openSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {openSections.categories && (
          <div className="mt-2 space-y-2.5 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => handleFilterChange("category", undefined)}
              className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-400 hover:text-foreground transition-colors"
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                  !currentParams.category ? "bg-[var(--accent)] border-[var(--accent)] text-white" : ""
                }`}
              >
                {!currentParams.category && (
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              <span>All Products</span>
            </button>
            {categories.map((category) => {
              const isActive = currentParams.category === category.slug || currentParams.category === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange("category", category.slug)}
                  className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-400 hover:text-foreground transition-colors"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                      isActive ? "bg-[var(--accent)] border-[var(--accent)] text-white" : ""
                    }`}
                  >
                    {isActive && (
                      <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands Section */}
      <div className="border-b border-electrox-elevated pb-4">
        <button
          onClick={() => toggleSection("brands")}
          className="flex w-full items-center justify-between py-2 text-left font-bold text-sm text-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span>BRANDS</span>
          {openSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.brands && (
          <div className="mt-2 space-y-3">
            {/* Search Input inside brands list */}
            {brands.length > 5 && (
              <div className="relative flex items-center rounded-lg bg-electrox-bg-2 border border-electrox-elevated px-2 py-1.5 focus-within:border-[var(--accent)]">
                <Search size={14} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search brand..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="ml-1.5 w-full bg-transparent text-xs font-semibold text-foreground outline-none"
                />
              </div>
            )}
            
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => handleFilterChange("brand", undefined)}
                className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-400 hover:text-foreground transition-colors"
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                    !currentParams.brand ? "bg-[var(--accent)] border-[var(--accent)] text-white" : ""
                  }`}
                >
                  {!currentParams.brand && (
                    <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>
                <span>All Brands</span>
              </button>
              {filteredBrands.map((brandName) => {
                const isActive = currentParams.brand === brandName;
                return (
                  <button
                    key={brandName}
                    onClick={() => handleFilterChange("brand", brandName)}
                    className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-400 hover:text-foreground transition-colors"
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                        isActive ? "bg-[var(--accent)] border-[var(--accent)] text-white" : ""
                      }`}
                    >
                      {isActive && (
                        <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                    <span>{brandName}</span>
                  </button>
                );
              })}
              {filteredBrands.length === 0 && (
                <p className="text-xs text-neutral-500 py-1">No brands found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="border-b border-electrox-elevated pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between py-2 text-left font-bold text-sm text-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span>PRICE LIMIT</span>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.price && (
          <form onSubmit={handlePriceSubmit} className="mt-2 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Max Price Limit</span>
              <span className="font-black text-[var(--accent)]">{formatMoney(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="15000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full cursor-pointer accent-[var(--accent)]"
              style={{ caretColor: "transparent" }}
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-electrox-elevated bg-electrox-bg-2 py-2 text-xs font-black text-foreground hover:border-[var(--accent)] hover:bg-electrox-surface transition"
            >
              Apply Price
            </button>
          </form>
        )}
      </div>

      {/* Ratings Section */}
      <div className="border-b border-electrox-elevated pb-4">
        <button
          onClick={() => toggleSection("ratings")}
          className="flex w-full items-center justify-between py-2 text-left font-bold text-sm text-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span>CUSTOMER RATINGS</span>
          {openSections.ratings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.ratings && (
          <div className="mt-2 space-y-2.5">
            {[4, 3, 2].map((stars) => {
              const isActive = currentParams.rating === String(stars);
              return (
                <button
                  key={stars}
                  onClick={() => handleFilterChange("rating", isActive ? undefined : String(stars))}
                  className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-450 hover:text-foreground transition-colors"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                      isActive ? "bg-[var(--accent)] border-[var(--accent)] text-white" : ""
                    }`}
                  >
                    {isActive && (
                      <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < stars ? "currentColor" : "none"}
                        className={i < stars ? "text-amber-400" : "text-neutral-500"}
                      />
                    ))}
                    <span className="ml-1 text-neutral-400">& up</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div className="border-b border-electrox-elevated pb-4">
        <button
          onClick={() => toggleSection("materials")}
          className="flex w-full items-center justify-between py-2 text-left font-bold text-sm text-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span>MATERIALS</span>
          {openSections.materials ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.materials && (
          <div className="mt-2 space-y-2.5">
            {["Premium", "Standard", "Eco"].map((mat) => {
              const isActive = currentParams.material === mat;
              return (
                <button
                  key={mat}
                  onClick={() => handleFilterChange("material", isActive ? undefined : mat)}
                  className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-450 hover:text-foreground transition-colors"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                      isActive ? "bg-[var(--accent)] border-[var(--accent)] text-white" : ""
                    }`}
                  >
                    {isActive && (
                      <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                  <span>{mat}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div>
        <button
          onClick={() => toggleSection("availability")}
          className="flex w-full items-center justify-between py-2 text-left font-bold text-sm text-foreground hover:text-[var(--accent)] transition-colors"
        >
          <span>AVAILABILITY</span>
          {openSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.availability && (
          <div className="mt-2 space-y-2.5">
            <button
              onClick={() =>
                handleFilterChange(
                  "availability",
                  currentParams.availability === "in-stock" ? undefined : "in-stock"
                )
              }
              className="flex w-full items-center gap-2.5 text-left text-xs font-semibold text-neutral-450 hover:text-foreground transition-colors"
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-600 transition-all ${
                  currentParams.availability === "in-stock"
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : ""
                }`}
              >
                {currentParams.availability === "in-stock" && (
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              <span>In Stock Only</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
