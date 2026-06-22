import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Search, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { formatMoney } from "@/lib/utils";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { collectionPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { AeoSection } from "@/components/aeo-section";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const categories = await fetchCategories();
  const category = params.category ? categories.find((item) => item.slug === params.category || item.id === params.category) : null;
  const hasSearchQuery = Boolean(params.q?.trim());
  const pageSuffix = params.page ? ` - Page ${params.page}` : "";
  
  const title = category 
    ? `${category.name}${pageSuffix} | The Grim Store` 
    : hasSearchQuery 
      ? `Search results for ${params.q}${pageSuffix} | The Grim Store` 
      : `Shop Catalog${pageSuffix} | The Grim Store`;
      
  const description = category
    ? `Shop ${category.name.toLowerCase()} products, premium picks, and verified inventory from The Grim Store.${pageSuffix}`
    : hasSearchQuery
      ? `Search The Grim Store catalog for ${params.q}.${pageSuffix}`
      : `Browse premium smart toys, gaming gadgets, and live catalog products from The Grim Store.${pageSuffix}`;

  return {
    title,
    description,
    alternates: { canonical: category ? `/products?category=${category.slug}` : "/products" },
    robots: hasSearchQuery ? { index: false, follow: true } : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { title, description, url: category ? `/products?category=${category.slug}` : "/products", type: "website" }
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  
  // Parallel fetch matching current filter parameters
  const [{ items: products, total }, brandProducts, categories] = await Promise.all([
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
    fetchProducts({ 
      q: params.q, 
      category: params.category, 
      gender: params.gender, 
      limit: 100 
    }),
    fetchCategories()
  ]);

  const uniqueBrands = Array.from(new Set(brandProducts.items.map((p) => p.brand).filter(Boolean)));
  const activeCategory = params.category ? categories.find((item) => item.slug === params.category || item.id === params.category) : null;
  const pageTitle = activeCategory ? activeCategory.name : params.q ? `Search "${params.q}"` : "Catalog";
  const chips = [{ id: "all", name: "All Products", slug: "" }, ...categories.slice(0, 7)];
  
  const sortLinks = [
    { label: "Popularity", value: "popular" },
    { label: "Price Low To High", value: "price-asc" },
    { label: "Price High To Low", value: "price-desc" },
    { label: "Rating", value: "rating" }
  ];

  let filteredProducts = [...products];

  if (params.rating) {
    const minRating = Number(params.rating);
    filteredProducts = filteredProducts.filter((p) => p.rating >= minRating);
  }

  if (params.material) {
    const targetMat = params.material.toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      p.variants.some((v) => v.material?.toLowerCase() === targetMat)
    );
  }

  if (params.availability === "in-stock") {
    filteredProducts = filteredProducts.filter((p) => p.stock > 0);
  }

  function getFilterUrl(newParams: Record<string, string | number | undefined>) {
    const merged = { ...params, ...newParams };
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    return `/products${query.toString() ? `?${query.toString()}` : ""}`;
  }

  function getRemoveParamUrl(key: string) {
    const merged = { ...params };
    delete merged[key];
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") query.set(k, String(v));
    }
    return `/products${query.toString() ? `?${query.toString()}` : ""}`;
  }

  const activeFilters = [];
  if (params.category) activeFilters.push({ label: `Category: ${activeCategory?.name ?? params.category}`, key: "category" });
  if (params.brand) activeFilters.push({ label: `Brand: ${params.brand}`, key: "brand" });
  if (params.q) activeFilters.push({ label: `Search: ${params.q}`, key: "q" });
  if (params.max) activeFilters.push({ label: `Max Price: ${formatMoney(Number(params.max))}`, key: "max" });
  if (params.rating) activeFilters.push({ label: `Rating: ${params.rating}★ & up`, key: "rating" });
  if (params.material) activeFilters.push({ label: `Material: ${params.material}`, key: "material" });
  if (params.availability) activeFilters.push({ label: `In Stock Only`, key: "availability" });

  const collectionName = activeCategory ? activeCategory.name : "Shop Catalog";
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" }
  ];
  if (activeCategory) {
    crumbs.push({ name: activeCategory.name, url: `/products?category=${activeCategory.slug}` });
  }

  return (
    <main className="mobile-bottom-safe mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-transparent">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd(collectionName, filteredProducts)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />
      
      {/* Category Chips for Mobile */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto scroll-snap-x pb-2.5 lg:hidden" style={{ scrollbarWidth: "none" }}>
        {chips.map((category) => {
          const active = category.slug ? params.category === category.slug || params.category === category.id : !params.category;
          return (
            <Link 
              key={category.id} 
              href={category.slug ? getFilterUrl({ category: category.slug }) : "/products"} 
              className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-heading font-extrabold uppercase tracking-wider transition ${
                active 
                  ? "bg-[#FF6B35] text-white shadow-xs" 
                  : "bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {/* Catalog Title & Search Box */}
      <div className="mb-6 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 bg-white dark:bg-[#151B26] p-5 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#FF6B35]">Catalog Listing</span>
            <h1 className="mt-1 text-3xl font-heading font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none">{pageTitle}</h1>
            <p className="mt-2 text-xs font-semibold text-neutral-400">{filteredProducts.length} premium items found</p>
          </div>
          <form action="/products" className="flex min-h-12 w-full max-w-xl items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-neutral-900/60 px-4 focus-within:ring-2 focus-within:ring-[#FF6B35]/30 transition-all">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.brand && <input type="hidden" name="brand" value={params.brand} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            <Search size={16} className="text-[#FF6B35] mr-2.5 shrink-0" />
            <input 
              name="q" 
              defaultValue={params.q ?? ""} 
              className="min-w-0 flex-1 border-0 bg-transparent text-xs font-semibold outline-none text-neutral-800 dark:text-neutral-250 placeholder-neutral-400" 
              placeholder='Search smart toys, headphones, gaming...' 
            />
            <button className="rounded-lg bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-4 py-1.5 text-xs font-heading font-extrabold uppercase tracking-wider hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] dark:hover:text-white transition-colors cursor-pointer">
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        
        {/* Desktop Collapsible Filters Sidebar */}
        <aside className="hidden h-fit rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-5 lg:sticky lg:top-28 lg:block shadow-xs">
          <div className="mb-4 flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
            <SlidersHorizontal size={14} className="text-[#FF6B35]" /> Filters
          </div>
          <Suspense fallback={<div className="h-60 animate-pulse bg-neutral-100/50 dark:bg-neutral-900/50 rounded-xl" />}>
            <FiltersSidebar categories={categories} brands={uniqueBrands} currentParams={params} />
          </Suspense>
        </aside>

        {/* Product Grid Section */}
        <section className="space-y-4">
          
          {/* Sorting Header */}
          <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#151B26] p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <Link 
              href={getFilterUrl({ showFilters: "true" })} 
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-4 text-xs font-heading font-extrabold uppercase tracking-wider lg:hidden hover:bg-[#FF6B35] transition-colors"
            >
              <SlidersHorizontal size={14} /> Filters ({activeFilters.length})
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-heading font-extrabold text-neutral-900 dark:text-neutral-300 uppercase tracking-wider">Sort By:</span>
              <div className="flex flex-wrap gap-1">
                {sortLinks.map((item) => {
                  const active = params.sort === item.value || (!params.sort && item.value === "popular");
                  return (
                    <Link 
                      key={item.value} 
                      href={getFilterUrl({ sort: item.value })} 
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-heading font-extrabold uppercase tracking-wider transition ${
                        active 
                          ? "bg-[#FF6B35] text-white shadow-xs" 
                          : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-850"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters List */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#FF6B35]">Active:</span>
              {activeFilters.map((filter) => (
                <Link 
                  key={filter.key} 
                  href={getRemoveParamUrl(filter.key)} 
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 hover:border-red-400 hover:text-red-500 transition"
                >
                  {filter.label}
                  <X size={12} className="stroke-[2.5]" />
                </Link>
              ))}
              <Link 
                href="/products" 
                className="rounded-lg bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-3 py-1 text-[10px] font-heading font-black uppercase tracking-wider hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] dark:hover:text-white transition"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {!filteredProducts.length && (
            <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 bg-white dark:bg-[#151B26] p-12 text-center shadow-xs">
              <p className="text-sm font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">No products found</p>
              <p className="mt-2 text-xs font-semibold text-neutral-400">Try adjusting your filters, category choices, or search phrase.</p>
              <Link href="/products" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#FF6B35] px-6 text-xs font-heading font-extrabold uppercase tracking-wider text-white hover:bg-[#FF6B35]/90 transition">
                Reset Catalog
              </Link>
            </div>
          )}

          <AeoSection categorySlug={params.category} />
        </section>
      </div>

      {/* Mobile Filters Drawer */}
      {params.showFilters === "true" && (
        <div className="fixed inset-0 z-[150] bg-neutral-950/40 backdrop-blur-xs p-4 lg:hidden">
          <div className="flex h-full flex-col rounded-3xl bg-white dark:bg-[#0B0F19] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800 px-5 py-4">
              <span className="text-base font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#FF6B35]" /> Filters
              </span>
              <Link 
                href={getRemoveParamUrl("showFilters")} 
                className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950"
              >
                <X size={18} />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <Suspense fallback={<div className="h-60 animate-pulse bg-neutral-100/50 dark:bg-neutral-900/50 rounded-xl" />}>
                <FiltersSidebar categories={categories} brands={uniqueBrands} currentParams={params} />
              </Suspense>
            </div>
            <div className="border-t border-neutral-200/50 dark:border-neutral-800 p-4 bg-white dark:bg-[#151B26]">
              <Link 
                href={getRemoveParamUrl("showFilters")} 
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#FF6B35] text-white text-xs font-heading font-extrabold uppercase tracking-wider shadow-sm hover:bg-[#FF6B35]/90 transition-colors"
              >
                Apply Filters
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
