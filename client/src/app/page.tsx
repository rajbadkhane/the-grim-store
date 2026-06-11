import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Camera,
  Cpu,
  Gamepad2,
  Headphones,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Watch,
  Wifi
} from "lucide-react";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";
import { ProductCardFigma } from "@/components/product-card-figma";
import { formatMoney } from "@/lib/utils";

const CATEGORY_ICON_MAP: Record<string, any> = {
  phones: Smartphone,
  computers: Monitor,
  smartwatch: Watch,
  camera: Camera,
  headphones: Headphones,
  gaming: Gamepad2
};

export default async function HomePage() {
  const [{ items: products }, categories] = await Promise.all([
    fetchProducts({ limit: 40 }),
    fetchCategories()
  ]);

  const heroProducts = products.filter((product) => Boolean(product.image));
  const hero = heroProducts[0] ?? products[0];
  const secondaryHero = heroProducts[1] ?? products[1];
  const deals = products.filter((p) => p.price > p.salePrice).slice(0, 8);
  const featured = products.filter((product) => product.badge === "Featured" || product.image).slice(0, 8);
  const trending = products.filter((product) => product.badge === "Trending" || product.price > product.salePrice).slice(0, 4);

  return (
    <div className="overflow-hidden pb-20 text-foreground">
      
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] px-4 pt-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.06),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.04),transparent_26rem)]" />
        
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div data-reveal className="pt-12 lg:pt-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-electrox-blue/20 bg-electrox-blue/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-electrox-blue shadow-sm">
              <Sparkles size={15} /> The Grim Store
            </div>
            
            <h1 className="electrox-gradient-text mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Future-ready tech, curated for you.
            </h1>
            
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-neutral-450 sm:text-lg">
              Explore premium electronics, gadgets, and smart accessories. Live order tracking, secure Razorpay checkout, and swift delivery support.
            </p>
            
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 px-7 text-sm font-black uppercase tracking-[0.2em] text-white shadow-md transition hover:-translate-y-0.5">
                Shop Catalog <ArrowRight size={17} />
              </Link>
              <Link href="/products?sort=popular" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-electrox-elevated bg-electrox-surface px-7 text-sm font-black uppercase tracking-[0.2em] text-foreground hover:border-electrox-blue hover:bg-electrox-blue/5 transition">
                Trending Tech
              </Link>
            </div>
            
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["Live SKUs", products.length],
                ["Categories", categories.length],
                ["Secure", "Razorpay"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-electrox-elevated bg-electrox-surface p-4 shadow-sm">
                  <p className="text-xl font-black text-foreground">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-neutral-450">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal data-parallax className="relative min-h-[520px]">
            <div className="absolute left-6 top-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="absolute bottom-12 right-4 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />
            
            {hero && (
              <Link href={`/products/${hero.slug}`} className="electrox-card absolute right-0 top-12 block w-[82%] rounded-[1.5rem] p-4 transition hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-50 dark:bg-[#121212]">
                  {hero.image && <Image src={hero.image} alt={hero.title} fill priority sizes="(max-width: 1024px) 80vw, 40vw" className="object-contain p-8 drop-shadow-sm" />}
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-electrox-blue">Featured Device</p>
                    <h2 className="mt-2 line-clamp-2 text-xl font-black text-foreground">{hero.title}</h2>
                  </div>
                  <p className="text-lg font-black text-electrox-blue">{formatMoney(hero.salePrice)}</p>
                </div>
              </Link>
            )}
            
            {secondaryHero && (
              <Link href={`/products/${secondaryHero.slug}`} className="electrox-card absolute bottom-6 left-0 w-[56%] rounded-2xl p-3 shadow-md backdrop-blur-2xl transition hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50 dark:bg-[#121212]">
                  {secondaryHero.image && <Image src={secondaryHero.image} alt={secondaryHero.title} fill sizes="240px" className="object-contain p-4" />}
                </div>
                <p className="mt-3 line-clamp-1 text-xs font-black text-foreground">{secondaryHero.title}</p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <SectionEyebrow label="Categories" title="Explore ecosystems" href="/products">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((cat, index) => {
            const Icon = CATEGORY_ICON_MAP[cat.slug] || [Cpu, Wifi, BatteryCharging, Headphones, Camera, Watch][index % 6];
            return (
              <Link
                data-reveal
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group rounded-2xl border border-electrox-elevated bg-electrox-surface p-5 text-center transition hover:-translate-y-1 hover:border-electrox-blue hover:bg-electrox-blue/5 hover:shadow-md"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-electrox-bg-2 text-electrox-blue transition group-hover:scale-110">
                  <Icon size={24} />
                </span>
                <span className="mt-4 block text-xs font-black text-foreground">{cat.name}</span>
                <span className="mt-1 block text-[10px] text-neutral-450">{cat.product_count ?? 0} products</span>
              </Link>
            );
          })}
        </div>
      </SectionEyebrow>

      {/* Special Deals Grid */}
      <SectionEyebrow label="Deals" title="Premium offers" href="/products?sort=popular">
        <ProductGrid products={deals.slice(0, 4)} />
      </SectionEyebrow>

      {/* Smart Home Split Banner */}
      <SplitBanner
        eyebrow="Smart Ecosystem"
        title="Minimal effort, seamless connectivity."
        text="Experience wireless audio, charging hubs, and gadgets tailored to keep you ahead."
        href="/products"
        image={heroProducts[2]?.image ?? hero?.image}
      />

      {/* Featured Products */}
      <SectionEyebrow label="Featured" title="Curated collections" href="/products">
        <ProductGrid products={featured.slice(0, 8)} />
      </SectionEyebrow>

      {/* Gaming Banner */}
      <SplitBanner
        reverse
        eyebrow="Low Latency"
        title="Tuned for peak gaming sessions."
        text="Gear up with responsive accessories and gaming hubs designed for absolute control."
        href="/products?sort=popular"
        image={heroProducts[3]?.image ?? secondaryHero?.image}
      />

      {/* Trending Grid */}
      <SectionEyebrow label="Trending" title="Highest rated tech" href="/products?sort=rating">
        <ProductGrid products={trending} />
      </SectionEyebrow>

      {/* Signal Drop newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div data-reveal className="electrox-card rounded-3xl p-6 sm:p-10 shadow-sm border border-electrox-elevated bg-electrox-surface">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-electrox-blue">Signal Drop</p>
              <h2 className="electrox-gradient-text mt-3 text-3xl font-black tracking-tight sm:text-4xl">Be first to claim launches.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-450 font-semibold">Fresh stock, exclusive coupons, and catalog changes direct to your inbox.</p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input className="min-h-12 flex-1 rounded-2xl border border-electrox-elevated bg-electrox-bg-2 px-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue" placeholder="Email address" />
              <button className="min-h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 px-6 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:shadow-md">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Badging */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        {[
          [Truck, "Swift Dispatch", "Live updates and courier tracking code on order checkout."],
          [ShieldCheck, "Razorpay secure", "Fully verified orders processed on backend service."],
          [Sparkles, "Grim warranty", "Handled directly by support ticket system."]
        ].map(([Icon, title, text]) => {
          const IconComponent = Icon as typeof Truck;
          return (
            <div data-reveal key={title as string} className="rounded-2xl border border-electrox-elevated bg-electrox-surface p-6 shadow-sm">
              <IconComponent size={24} className="text-electrox-blue" />
              <h3 className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-foreground">{title as string}</h3>
              <p className="mt-2 text-xs leading-6 text-neutral-450 font-semibold">{text as string}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function SectionEyebrow({ label, title, href, children }: { label: string; title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div data-reveal className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-electrox-blue">{label}</p>
          <h2 className="electrox-gradient-text mt-2 text-2xl font-black tracking-tight sm:text-4xl">{title}</h2>
        </div>
        <Link href={href} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-neutral-450 transition hover:text-electrox-blue">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCardFigma key={product.id} product={product} />
      ))}
    </div>
  );
}

function SplitBanner({
  eyebrow,
  title,
  text,
  href,
  image,
  reverse
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  image?: string;
  reverse?: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div data-reveal className={`electrox-card grid gap-8 rounded-3xl p-5 sm:p-8 lg:grid-cols-2 lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="p-3 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-electrox-blue">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-xl text-xs sm:text-sm leading-6 text-neutral-450 font-semibold">{text}</p>
          <Link href={href} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl border border-electrox-blue/20 bg-electrox-blue/5 px-6 text-xs font-black uppercase tracking-wider text-electrox-blue transition hover:bg-electrox-blue/10">
            Explore <ArrowRight size={14} />
          </Link>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-electrox-elevated bg-neutral-50 dark:bg-[#121212]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.04),transparent_38%)]" />
          {image && <Image src={image} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8" />}
        </div>
      </div>
    </section>
  );
}
