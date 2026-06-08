import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Smartphone,
  Monitor,
  Watch,
  Camera,
  Headphones,
  Gamepad2,
  Truck,
  Headset,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { CountdownTimer } from "@/components/home/countdown-timer";
import { HeroSlider } from "@/components/home/hero-slider";
import { ProductCardFigma } from "@/components/product-card-figma";

const CATEGORY_ICON_MAP: Record<string, any> = {
  "phones": Smartphone,
  "computers": Monitor,
  "smartwatch": Watch,
  "camera": Camera,
  "headphones": Headphones,
  "gaming": Gamepad2
};

export default async function HomePage() {
  const [{ items: products }, categories] = await Promise.all([
    fetchProducts({ limit: 40 }),
    fetchCategories()
  ]);

  const sidebarCategories = categories.slice(0, 9);
  const flashSaleProducts = products.filter((p) => p.price > p.salePrice).slice(0, 8);
  const exploreProducts = products.filter((product) => !flashSaleProducts.some((saleProduct) => saleProduct.id === product.id));
  const categoryGridList = categories.slice(0, 6);
  const showcaseProducts = products.filter((product) => Boolean(product.image)).slice(0, 4);
  const featurePrimary = showcaseProducts[0];
  const featureWide = showcaseProducts[1];
  const featureSmallOne = showcaseProducts[2];
  const featureSmallTwo = showcaseProducts[3];

  return (
    <div className="pb-16 bg-white dark:bg-[#070707] text-neutral-900 dark:text-[#f7f3ef] transition-colors duration-300">
      {/* 1. HERO SECTION WITH SIDEBAR & SLIDER */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Category Sidebar */}
          <aside className="hidden lg:block border-r border-neutral-200 dark:border-white/10 pr-6">
            <nav className="flex flex-col gap-3.5">
              {sidebarCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center justify-between text-sm font-semibold text-neutral-700 dark:text-white/75 hover:text-red-550 dark:hover:text-red-400 py-1 transition-colors duration-200"
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={14} className="text-neutral-400 dark:text-white/40" />
                </Link>
              ))}
            </nav>
          </aside>

          {/* Right Hero Slider */}
          <div className="lg:col-span-3">
            <HeroSlider products={products.filter((product) => Boolean(product.image)).slice(0, 3)} />
          </div>
        </div>
      </section>

      {/* 2. FLASH SALES SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-white/5">
        {/* Subtitle / Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-10 bg-red-500 rounded-sm" />
                <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Today's</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Flash Sales</h2>
            </div>
            
            {/* Timer */}
            <div className="pb-1">
              <CountdownTimer />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-neutral-700 dark:text-white transition duration-200">
              <ArrowLeft size={16} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-neutral-700 dark:text-white transition duration-200">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {flashSaleProducts.slice(0, 4).map((product) => (
            <ProductCardFigma key={product.id} product={product} />
          ))}
        </div>

        {/* Centered Button */}
        <div className="mt-12 text-center">
          <Link
            href="/products?sort=popular"
            className="inline-flex min-h-12 items-center justify-center bg-red-500 hover:bg-red-650 text-white font-black px-12 rounded text-xs uppercase tracking-widest transition duration-200 shadow-[0_4px_20px_rgba(239,68,68,0.2)]"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* 3. BROWSE BY CATEGORY SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-white/5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-10 bg-red-500 rounded-sm" />
              <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Categories</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Browse By Category</h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-neutral-700 dark:text-white transition duration-200">
              <ArrowLeft size={16} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-neutral-700 dark:text-white transition duration-200">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Category Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categoryGridList.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.slug] || Monitor;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 p-6 text-center hover:bg-red-500 hover:border-red-500 hover:scale-102 hover:text-white dark:hover:text-white hover:dark:text-white text-neutral-800 dark:text-white/90 transition duration-300 gap-4"
              >
                <Icon size={36} className="text-neutral-700 dark:text-white group-hover:text-white group-hover:scale-110 transition duration-300" />
                <span className="text-xs font-black tracking-wide text-neutral-700 dark:text-white/80 group-hover:text-white transition duration-300">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. EXPLORE OUR PRODUCTS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-white/5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-10 bg-red-500 rounded-sm" />
              <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Our Products</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Explore Our Products</h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-neutral-700 dark:text-white transition duration-200">
              <ArrowLeft size={16} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-neutral-700 dark:text-white transition duration-200">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* 2x4 Product Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {exploreProducts.slice(0, 8).map((product) => (
            <ProductCardFigma key={product.id} product={product} />
          ))}
        </div>

        {/* Centered Button */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex min-h-12 items-center justify-center bg-red-500 hover:bg-red-650 text-white font-black px-12 rounded text-xs uppercase tracking-widest transition duration-200 shadow-[0_4px_20px_rgba(239,68,68,0.2)]"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* 5. NEW ARRIVALS BENTO GRID */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-10 bg-red-500 rounded-sm" />
            <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest">Featured</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">New Arrival</h2>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {featurePrimary && (
            <div className="relative md:col-span-2 min-h-[400px] md:h-[480px] bg-neutral-950 border border-neutral-250 dark:border-white/5 rounded-md overflow-hidden group">
              <Image
                src={featurePrimary.image}
                alt={featurePrimary.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-60 group-hover:scale-103 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <h3 className="text-xl sm:text-2xl font-black text-white">{featurePrimary.title}</h3>
                <p className="mt-2 text-xs text-white/70 max-w-xs leading-relaxed">
                  {featurePrimary.shortDescription || featurePrimary.description}
                </p>
                <Link
                  href={`/products/${featurePrimary.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border-b border-white/40 pb-0.5 hover:text-red-400 hover:border-red-400 transition"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          )}

          {/* Right Columns (Upper Row & Lower Row) */}
          <div className="md:col-span-2 grid grid-rows-1 gap-6">
            {featureWide && (
              <div className="relative min-h-[200px] md:h-[228px] bg-neutral-950 border border-neutral-250 dark:border-white/5 rounded-md overflow-hidden group">
                <Image
                  src={featureWide.image}
                  alt={featureWide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-60 group-hover:scale-103 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="text-lg font-black text-white">{featureWide.title}</h3>
                  <p className="mt-1 text-xs text-white/60 max-w-sm leading-relaxed">
                    {featureWide.shortDescription || featureWide.description}
                  </p>
                  <Link
                    href={`/products/${featureWide.slug}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border-b border-white/40 pb-0.5 hover:text-red-400 hover:border-red-400 transition"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Row - Two Squares Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featureSmallOne && (
                <div className="relative min-h-[200px] md:h-[228px] bg-neutral-950 border border-neutral-250 dark:border-white/5 rounded-md overflow-hidden group">
                  <Image
                    src={featureSmallOne.image}
                    alt={featureSmallOne.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover opacity-60 group-hover:scale-103 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <h3 className="text-md font-black text-white">{featureSmallOne.title}</h3>
                    <p className="mt-1 text-[11px] text-white/60 leading-relaxed">
                      {featureSmallOne.shortDescription || featureSmallOne.description}
                    </p>
                    <Link
                      href={`/products/${featureSmallOne.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border-b border-white/40 pb-0.5 hover:text-red-400 hover:border-red-400 transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              )}

              {featureSmallTwo && (
                <div className="relative min-h-[200px] md:h-[228px] bg-neutral-950 border border-neutral-250 dark:border-white/5 rounded-md overflow-hidden group">
                  <Image
                    src={featureSmallTwo.image}
                    alt={featureSmallTwo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover opacity-60 group-hover:scale-103 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <h3 className="text-md font-black text-white">{featureSmallTwo.title}</h3>
                    <p className="mt-1 text-[11px] text-white/60 leading-relaxed">
                      {featureSmallTwo.shortDescription || featureSmallTwo.description}
                    </p>
                    <Link
                      href={`/products/${featureSmallTwo.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border-b border-white/40 pb-0.5 hover:text-red-400 hover:border-red-400 transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONCENTRIC-RING FOOTER FEATURES SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 ring-[6px] ring-neutral-200/50 dark:ring-white/5 text-neutral-800 dark:text-white">
              <Truck size={24} />
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">Free and Fast Delivery</h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-white/50">Free delivery for all orders over $140</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 ring-[6px] ring-neutral-200/50 dark:ring-white/5 text-neutral-800 dark:text-white">
              <Headset size={24} />
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">24/7 Customer Service</h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-white/50">Friendly 24/7 customer support</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 ring-[6px] ring-neutral-200/50 dark:ring-white/5 text-neutral-800 dark:text-white">
              <ShieldCheck size={24} />
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">Money Back Guarantee</h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-white/50">We return money within 30 days</p>
          </div>
        </div>
      </section>
    </div>
  );
}
