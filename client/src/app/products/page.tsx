import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { PriceFilter } from "@/components/price-filter";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const categories = await fetchCategories();
  const category = params.category ? categories.find((item) => item.slug === params.category || item.id === params.category) : null;
  const hasSearchQuery = Boolean(params.q?.trim());
  const title = category ? `${category.name} Products` : hasSearchQuery ? `Search results for ${params.q}` : "Shop Premium Products";
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
  const pageTitle = activeCategory ? activeCategory.name : params.q ? `Search results for "${params.q}"` : "Shop All Products";
  const sortLinks = [
    { label: "Latest", value: "latest" },
    { label: "Price low to high", value: "price-asc" },
    { label: "Price high to low", value: "price-desc" },
    { label: "Rating", value: "rating" }
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-[0_20px_80px_rgba(15,15,15,0.08)] dark:border-white/10 dark:bg-[#0b0b0b] dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="relative px-5 py-6 sm:px-7 lg:px-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-400" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600 dark:text-red-400">Curated catalog</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl dark:text-white">{pageTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-neutral-500 dark:text-white/55">
                {total ?? products.length} live products from backend inventory.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/products"
                className={`rounded-md border px-3.5 py-2 text-sm font-black transition ${
                  !params.category
                    ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/15"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/70 dark:hover:bg-red-600/10 dark:hover:text-red-300"
                }`}
              >
                All
              </a>
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={getFilterUrl({ category: category.slug })}
                  className={`rounded-md border px-3.5 py-2 text-sm font-black transition ${
                    params.category === category.slug || params.category === category.id
                      ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/15"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/70 dark:hover:bg-red-600/10 dark:hover:text-red-300"
                  }`}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-8 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-md border border-neutral-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,15,15,0.07)] lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none">
          <div className="flex items-center gap-2 font-black text-neutral-950 dark:text-white">
            <SlidersHorizontal size={18} /> Filters
          </div>
          <label className="mt-5 block text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-white/50">Search</label>
          <form action="/products">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.brand && <input type="hidden" name="brand" value={params.brand} />}
            {params.gender && <input type="hidden" name="gender" value={params.gender} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            {params.max && <input type="hidden" name="max" value={params.max} />}
            <input name="q" defaultValue={params.q ?? ""} className="mt-2 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-950 outline-none transition focus:border-red-500 focus:bg-white dark:border-white/10 dark:bg-black dark:text-white" placeholder="Search products" />
            <button className="mt-3 w-full rounded-md bg-gradient-to-r from-red-650 via-red-500 to-amber-500 px-3 py-3 text-sm font-black text-white shadow-lg shadow-red-600/15 transition hover:shadow-red-600/25">
              Search
            </button>
          </form>
          <label className="mt-5 block text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-white/50">Sort</label>
          <div className="mt-2 grid gap-2">
            {sortLinks.map((item) => (
              <a
                key={item.value}
                className={`relative rounded-md border px-3 py-2 text-sm font-semibold transition after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-red-600 after:to-amber-400 after:transition-transform hover:border-red-500 hover:text-red-600 hover:after:scale-x-100 dark:hover:text-red-300 ${
                  params.sort === item.value
                    ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-600/10 dark:text-red-300"
                    : "border-neutral-200 bg-white text-neutral-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70"
                }`}
                href={getFilterUrl({ sort: item.value })}
              >
                {item.label}
              </a>
            ))}
          </div>
          <PriceFilter currentMax={params.max} />
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:text-white/54">
            <span>{total ?? products.length} products</span>
            <span>{activeCategory?.name ?? "All categories"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {!products.length && <p className="rounded-md border border-neutral-200 bg-white p-6 text-neutral-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/60">No products found.</p>}
        </section>
      </div>
    </div>
  );
}
