import type { Metadata } from "next";
import { Suspense } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { PriceFilter } from "@/components/price-filter";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const categories = await fetchCategories();
  const category = params.category ? categories.find((item) => item.slug === params.category || item.id === params.category) : null;
  const hasSearchQuery = Boolean(params.q?.trim());
  const title = category ? `${category.name} | The Grim Store` : hasSearchQuery ? `Search results for ${params.q} | The Grim Store` : "Shop Catalog | The Grim Store";
  const description = category
    ? `Shop ${category.name.toLowerCase()} products, premium picks, and verified inventory from The Grim Store.`
    : hasSearchQuery
      ? `Search The Grim Store catalog for ${params.q}.`
      : "Browse premium electronics, accessories, and live catalog products from The Grim Store.";

  return {
    title,
    description,
    alternates: { canonical: category ? `/products?category=${category.slug}` : "/products" },
    robots: hasSearchQuery
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      title,
      description,
      url: category ? `/products?category=${category.slug}` : "/products",
      type: "website"
    }
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [{ items: products, total }, categories] = await Promise.all([
    fetchProducts({
      q: params.q,
      category: params.category,
      brand: params.brand,
      gender: params.gender,
      sort: params.sort,
      min: params.min,
      max: params.max,
      limit: 100
    }),
    fetchCategories()
  ]);
  const activeCategory = params.category ? categories.find((item) => item.slug === params.category || item.id === params.category) : null;
  const pageTitle = activeCategory ? activeCategory.name : params.q ? `Search for "${params.q}"` : "Shop All Products";
  
  const sortLinks = [
    { label: "Latest", value: "latest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Ratings First", value: "rating" }
  ];

  function getFilterUrl(newParams: Record<string, string | number | undefined>) {
    const merged = { ...params, ...newParams };
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    }
    return `/products?${query.toString()}`;
  }

  function getRemoveParamUrl(key: string) {
    const merged = { ...params };
    delete merged[key];
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") {
        query.set(k, String(v));
      }
    }
    return `/products?${query.toString()}`;
  }

  const activeFilters = [];
  if (params.category) {
    activeFilters.push({ label: `Category: ${activeCategory?.name ?? params.category}`, key: "category" });
  }
  if (params.q) {
    activeFilters.push({ label: `Search: "${params.q}"`, key: "q" });
  }
  if (params.max) {
    activeFilters.push({ label: `Max Price: ${formatMoney(Number(params.max))}`, key: "max" });
  }
  if (params.brand) {
    activeFilters.push({ label: `Brand: ${params.brand}`, key: "brand" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-foreground sm:px-6 lg:px-8">
      
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/50 dark:border-neutral-800 pb-5">
        <div>
          <nav className="text-xs font-bold text-neutral-450 uppercase tracking-widest mb-1.5">
            Home / Products / <span className="text-indigo-600 dark:text-indigo-400">{activeCategory?.name ?? "Catalog"}</span>
          </nav>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">{pageTitle}</h1>
          <p className="mt-1 text-xs text-neutral-450 font-semibold">
            {total ?? products.length} premium products available
          </p>
        </div>

        {/* Category horizontal tag menu */}
        <div className="flex flex-wrap gap-1.5">
          <a
            href="/products"
            className={`rounded px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
              !params.category
                ? "bg-indigo-650 text-white shadow-sm"
                : "border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-[#0c0c0e] text-neutral-400 dark:text-neutral-500 hover:border-indigo-600 hover:text-foreground"
            }`}
          >
            All
          </a>
          {categories.map((category) => (
            <a
              key={category.id}
              href={getFilterUrl({ category: category.slug })}
              className={`rounded px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                params.category === category.slug || params.category === category.id
                  ? "bg-indigo-650 text-white shadow-sm"
                  : "border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-[#0c0c0e] text-neutral-400 dark:text-neutral-500 hover:border-indigo-600 hover:text-foreground"
              }`}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        
        {/* Sidebar Filters */}
        <aside className="h-fit rounded-xl border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-[#0c0c0e] p-5 lg:sticky lg:top-24 shadow-sm">
          <div className="flex items-center gap-2 font-black text-foreground text-xs uppercase tracking-widest border-b border-neutral-200/50 dark:border-neutral-800 pb-3">
            <SlidersHorizontal size={14} className="text-indigo-650 dark:text-indigo-400" /> Filters
          </div>
          
          {/* Filter Section: Search */}
          <div className="border-b border-neutral-200/40 dark:border-neutral-800/40 py-4">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Search keywords</label>
            <form action="/products" className="grid gap-1.5">
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.brand && <input type="hidden" name="brand" value={params.brand} />}
              {params.gender && <input type="hidden" name="gender" value={params.gender} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              {params.max && <input type="hidden" name="max" value={params.max} />}
              <input name="q" defaultValue={params.q ?? ""} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-indigo-500" placeholder="e.g. Phone, Speaker..." />
              <button className="w-full rounded-lg bg-indigo-650 hover:bg-indigo-700 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                Apply
              </button>
            </form>
          </div>

          {/* Filter Section: Price */}
          <div className="py-4">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Price budget</label>
            <Suspense fallback={<div className="h-16 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />}>
              <PriceFilter currentMax={params.max} />
            </Suspense>
          </div>
        </aside>

        {/* Catalog Grid Section */}
        <section>
          
          {/* Sort Menu Tab Row + Filter Summary */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-[#0c0c0e] px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mr-1">Sort By:</span>
              <div className="flex flex-wrap items-center gap-1">
                {sortLinks.map((item) => {
                  const isActive = params.sort === item.value || (!params.sort && item.value === "latest");
                  return (
                    <a
                      key={item.value}
                      href={getFilterUrl({ sort: item.value })}
                      className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition ${
                        isActive
                          ? "bg-indigo-650 text-white shadow-sm scale-[1.02]"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 shrink-0">
              Showing {products.length} products
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mr-1">Active filters:</span>
              {activeFilters.map((filter) => (
                <a
                  key={filter.key}
                  href={getRemoveParamUrl(filter.key)}
                  className="inline-flex items-center gap-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 px-2 py-0.5 text-[9px] font-black text-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition"
                >
                  {filter.label}
                  <X size={10} />
                </a>
              ))}
              <a
                href="/products"
                className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
              >
                Clear all
              </a>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {!products.length && (
            <p className="rounded-xl border border-neutral-200/50 dark:border-neutral-850 bg-white dark:bg-[#0c0c0e] p-8 text-center text-xs font-semibold text-neutral-450 shadow-sm">
              No products match these constraints. Please modify filters or search.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
