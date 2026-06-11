import type { Metadata } from "next";
import { Suspense } from "react";
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
    <div className="mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="electrox-card overflow-hidden rounded-[2rem]">
        <div className="relative px-5 py-6 sm:px-7 lg:px-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">Curated catalog</p>
              <h1 className="electrox-gradient-text mt-2 text-3xl font-black tracking-tight sm:text-5xl">{pageTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-400">
                {total ?? products.length} live products from backend inventory.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/products"
                className={`rounded-md border px-3.5 py-2 text-sm font-black transition ${
                  !params.category
                    ? "border-blue-300/40 bg-blue-500/20 text-white shadow-lg shadow-blue-500/15"
                    : "border-white/10 bg-white/[0.045] text-slate-300 hover:border-blue-300/50 hover:bg-blue-500/10 hover:text-white"
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
                      ? "border-blue-300/40 bg-blue-500/20 text-white shadow-lg shadow-blue-500/15"
                      : "border-white/10 bg-white/[0.045] text-slate-300 hover:border-blue-300/50 hover:bg-blue-500/10 hover:text-white"
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
        <aside className="electrox-card h-fit rounded-[1.5rem] p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 font-black text-white">
            <SlidersHorizontal size={18} /> Filters
          </div>
          <label className="mt-5 block text-xs font-black uppercase tracking-widest text-slate-500">Search</label>
          <form action="/products">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.brand && <input type="hidden" name="brand" value={params.brand} />}
            {params.gender && <input type="hidden" name="gender" value={params.gender} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            {params.max && <input type="hidden" name="max" value={params.max} />}
            <input name="q" defaultValue={params.q ?? ""} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3 text-sm text-white outline-none transition focus:border-blue-300/60" placeholder="Search products" />
            <button className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 px-3 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30">
              Search
            </button>
          </form>
          <label className="mt-5 block text-xs font-black uppercase tracking-widest text-slate-500">Sort</label>
          <div className="mt-2 grid gap-2">
            {sortLinks.map((item) => (
              <a
                key={item.value}
                className={`relative rounded-2xl border px-3 py-2 text-sm font-semibold transition after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:transition-transform hover:border-blue-300/50 hover:text-white hover:after:scale-x-100 ${
                  params.sort === item.value
                    ? "border-blue-300/50 bg-blue-500/10 text-white"
                    : "border-white/10 bg-white/[0.035] text-slate-400"
                }`}
                href={getFilterUrl({ sort: item.value })}
              >
                {item.label}
              </a>
            ))}
          </div>
          <Suspense fallback={<div className="mt-5 h-24 rounded-2xl border border-white/10 bg-white/[0.035]" />}>
            <PriceFilter currentMax={params.max} />
          </Suspense>
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-400 shadow-sm backdrop-blur-xl">
            <span>{total ?? products.length} products</span>
            <span>{activeCategory?.name ?? "All categories"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {!products.length && <p className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-slate-400">No products found.</p>}
        </section>
      </div>
    </div>
  );
}
