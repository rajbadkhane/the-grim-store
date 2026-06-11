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
    <div className="overflow-hidden pb-20 text-white">
      <section className="relative min-h-[calc(100vh-5rem)] px-4 pt-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.24),transparent_26rem)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div data-reveal className="pt-12 lg:pt-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-100 shadow-[0_0_32px_rgba(59,130,246,0.16)] backdrop-blur-xl">
              <Sparkles size={15} /> ElectroX Dark Concept
            </div>
            <h1 className="electrox-gradient-text mt-6 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl lg:text-8xl">
              Future-ready electronics, tuned for speed.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
              Premium gadgets, smart accessories, live catalog inventory, secure Razorpay checkout, and delivery tracking from one high-performance storefront.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-blue-300/30 bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 px-7 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_50px_rgba(59,130,246,0.32)] transition hover:-translate-y-1 hover:shadow-[0_0_70px_rgba(168,85,247,0.42)]">
                Shop Catalog <ArrowRight size={17} />
              </Link>
              <Link href="/products?sort=popular" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.055] px-7 text-sm font-black uppercase tracking-[0.2em] text-slate-100 backdrop-blur-xl transition hover:border-blue-300/50 hover:bg-blue-500/10">
                Trending Tech
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["Live SKUs", products.length],
                ["Categories", categories.length],
                ["Secure", "Razorpay"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal data-parallax className="relative min-h-[520px]">
            <div className="absolute left-6 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-12 right-4 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
            {hero && (
              <Link href={`/products/${hero.slug}`} className="electrox-card absolute right-0 top-12 block w-[82%] rounded-[2rem] p-5 transition hover:-translate-y-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-white/10 to-white/[0.02]">
                  {hero.image && <Image src={hero.image} alt={hero.title} fill priority sizes="(max-width: 1024px) 80vw, 40vw" className="object-contain p-8 drop-shadow-[0_30px_80px_rgba(59,130,246,0.28)]" />}
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">Hero Device</p>
                    <h2 className="mt-2 line-clamp-2 text-2xl font-black text-white">{hero.title}</h2>
                  </div>
                  <p className="text-xl font-black text-blue-200">{formatMoney(hero.salePrice)}</p>
                </div>
              </Link>
            )}
            {secondaryHero && (
              <Link href={`/products/${secondaryHero.slug}`} className="absolute bottom-6 left-0 w-[56%] rounded-[1.6rem] border border-white/12 bg-[#0B1224]/82 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition hover:-translate-y-2">
                <div className="relative aspect-square overflow-hidden rounded-[1.1rem] bg-white/[0.04]">
                  {secondaryHero.image && <Image src={secondaryHero.image} alt={secondaryHero.title} fill sizes="240px" className="object-contain p-5" />}
                </div>
                <p className="mt-3 line-clamp-1 text-sm font-black text-white">{secondaryHero.title}</p>
              </Link>
            )}
          </div>
        </div>
      </section>

      <SectionEyebrow label="Categories" title="Browse by ecosystem" href="/products">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((cat, index) => {
            const Icon = CATEGORY_ICON_MAP[cat.slug] || [Cpu, Wifi, BatteryCharging, Headphones, Camera, Watch][index % 6];
            return (
              <Link
                data-reveal
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-center backdrop-blur-xl transition hover:-translate-y-2 hover:border-blue-300/50 hover:bg-blue-500/10 hover:shadow-[0_0_44px_rgba(59,130,246,0.18)]"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-[#111827] text-blue-200 transition group-hover:scale-110 group-hover:text-white">
                  <Icon size={27} />
                </span>
                <span className="mt-4 block text-sm font-black text-white">{cat.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{cat.product_count ?? 0} products</span>
              </Link>
            );
          })}
        </div>
      </SectionEyebrow>

      <SectionEyebrow label="Deals" title="High-signal offers" href="/products?sort=popular">
        <ProductGrid products={deals.slice(0, 4)} />
      </SectionEyebrow>

      <SplitBanner
        eyebrow="Smart Home"
        title="Connected living, minimal friction."
        text="Audio, cameras, charging, and smart everyday devices built into one fast catalog."
        href="/products"
        image={heroProducts[2]?.image ?? hero?.image}
      />

      <SectionEyebrow label="Featured" title="Curated electronics" href="/products">
        <ProductGrid products={featured.slice(0, 8)} />
      </SectionEyebrow>

      <SplitBanner
        reverse
        eyebrow="Gaming"
        title="Low-latency gear for sharper sessions."
        text="Controllers, audio, displays, and essentials selected for performance-first shopping."
        href="/products?sort=popular"
        image={heroProducts[3]?.image ?? secondaryHero?.image}
      />

      <SectionEyebrow label="Trending" title="What shoppers are watching" href="/products?sort=rating">
        <ProductGrid products={trending} />
      </SectionEyebrow>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div data-reveal className="electrox-card rounded-[2rem] p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-blue-200">Signal Drop</p>
              <h2 className="electrox-gradient-text mt-3 text-4xl font-black tracking-tight sm:text-5xl">Get launches before they sell out.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Fresh electronics, flash deals, and delivery updates in a compact, premium feed.</p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-white outline-none focus:border-blue-300/60" placeholder="Email address" />
              <button className="min-h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 px-6 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_0_38px_rgba(59,130,246,0.3)]">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        {[
          [Truck, "Fast Dispatch", "Live shipment booking after order confirmation."],
          [ShieldCheck, "Secure Payments", "Server-side Razorpay verification before fulfillment."],
          [Sparkles, "Premium Support", "Order records, tracking, and account details in one dashboard."]
        ].map(([Icon, title, text]) => {
          const IconComponent = Icon as typeof Truck;
          return (
            <div data-reveal key={title as string} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
              <IconComponent size={24} className="text-blue-200" />
              <h3 className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-white">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p>
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
      <div data-reveal className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-blue-200">{label}</p>
          <h2 className="electrox-gradient-text mt-2 text-3xl font-black tracking-tight sm:text-5xl">{title}</h2>
        </div>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-300 transition hover:text-white">
          View all <ArrowRight size={16} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
      <div data-reveal className={`electrox-card grid gap-8 rounded-[2rem] p-5 sm:p-8 lg:grid-cols-2 lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="p-3 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-purple-200">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">{title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">{text}</p>
          <Link href={href} className="mt-7 inline-flex min-h-13 items-center gap-2 rounded-2xl border border-blue-300/30 bg-blue-500/10 px-6 text-sm font-black uppercase tracking-[0.18em] text-blue-100 transition hover:bg-blue-500/20">
            Explore <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-purple-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.28),transparent_38%)]" />
          {image && <Image src={image} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-10" />}
        </div>
      </div>
    </section>
  );
}
