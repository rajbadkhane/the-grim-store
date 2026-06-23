"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Gamepad2,
  Headphones,
  Heart,
  Home,
  LockKeyhole,
  Mail,
  Monitor,
  PackageOpen,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  UploadCloud,
  Watch
} from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
};

type HomepageClientProps = {
  heroToy: any;
  heroGame: any;
  heroSmart: any;
  finalKids: any[];
  finalGaming: any[];
  finalSmart: any[];
  finalTrending: any[];
  finalBestsellers: any[];
  testimonials: Testimonial[];
  totalProducts: number;
};

const heroBenefits = [
  { title: "Free Shipping", subtitle: "On orders over $50", icon: Truck },
  { title: "1 Year Warranty", subtitle: "On selected products", icon: ShieldCheck },
  { title: "Easy Returns", subtitle: "30-day return policy", icon: RotateCcw },
  { title: "Secure Payments", subtitle: "100% protected checkout", icon: LockKeyhole }
];

const categoryTiles = [
  { label: "Audio & Headphones", href: "/products?q=headphones", icon: Headphones, image: "/category-icons/audio-headphones.png" },
  { label: "Gaming & Consoles", href: "/products?q=game", icon: Gamepad2, image: "/category-icons/gaming-consoles.png" },
  { label: "Smart Watches", href: "/products?q=watch", icon: Watch, image: "/category-icons/smart-watches.png" },
  { label: "Drones & Cameras", href: "/products?q=camera", icon: Camera, image: "/category-icons/drones-cameras.png" },
  { label: "Mobile Accessories", href: "/products?q=mobile", icon: Smartphone, image: "/category-icons/mobile-accessories.png" },
  { label: "Computer & Accessories", href: "/products?q=computer", icon: Monitor, image: "/category-icons/computer-accessories.png" },
  { label: "Smart Home Devices", href: "/products?q=smart", icon: Home, image: "/category-icons/smart-home-devices.png" },
  { label: "Custom Outfits", href: "#custom-outfits", icon: ShoppingBag },
  { label: "More Categories", href: "/products", icon: Grid2X2, image: "/category-icons/more-categories.png" }
];

const defaultBrands = [
  { name: "boAt", href: "/products?brand=boAt" },
  { name: "JBL", href: "/products?brand=JBL" },
  { name: "SONY", href: "/products?brand=SONY" },
  { name: "BOSE", href: "/products?brand=BOSE" },
  { name: "fire tv", href: "/products?brand=fire%20tv" },
  { name: "SAMSUNG", href: "/products?brand=SAMSUNG" },
  { name: "dji", href: "/products?brand=dji" },
  { name: "Apple", href: "/products?brand=Apple" }
];

const countdown = [
  ["08", "Hrs"],
  ["34", "Mins"],
  ["56", "Secs"]
];

const customOutfitOptions = [
  { key: "t-shirt", label: "T-Shirt", price: 299 },
  { key: "shirt", label: "Shirt", price: 399 },
  { key: "hoodie", label: "Hoodie", price: 499 }
];

const customSizes = ["S", "M", "L", "XL", "XXL"];

const customQualities = [
  { key: "standard", label: "Standard Print", desc: "Soft daily wear finish" },
  { key: "premium", label: "Premium Print", desc: "Sharper color and richer feel" },
  { key: "heavy-duty", label: "Heavy Duty", desc: "Longer-lasting print layer" }
];

export function HomepageClient({
  finalKids,
  finalGaming,
  finalSmart,
  finalTrending,
  finalBestsellers
}: HomepageClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const products = Array.from(
    new Map(
      [...finalTrending, ...finalKids, ...finalGaming, ...finalSmart, ...finalBestsellers]
        .filter(Boolean)
        .map((product) => [product.id, product])
    ).values()
  );
  const deals = products.slice(0, 6);
  const promoProducts = [
    pickProduct(products, ["watch", "smart"]),
    pickProduct(products, ["game", "stick"]),
    pickProduct(products, ["headphone", "audio", "earbud"])
  ];
  const brands = buildBrandStrip(products);

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] dark:bg-[#0A0A0A] dark:text-white">
      <section className="w-full px-0 pb-10 pt-0 sm:pb-12 lg:pb-18">
        <div className="group relative h-[310px] min-h-[310px] min-[360px]:h-[340px] min-[360px]:min-h-[340px] min-[400px]:h-[370px] min-[400px]:min-h-[370px] w-full overflow-hidden bg-[#111] shadow-2xl shadow-black/40 sm:h-[560px] sm:min-h-[500px] lg:h-[620px] xl:h-[640px]">
          <video
            src="/hero.mp4"
            className="absolute inset-0 h-full w-full scale-x-[1.02] object-cover object-[72%_center] opacity-100 sm:object-bottom"
            autoPlay
            muted
            loop
            playsInline
            aria-label="The Grim Store hero video"
          />
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_72%_42%,rgba(215,25,32,0.12),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.32)_42%,rgba(0,0,0,0.08)_72%,rgba(0,0,0,0.24)_100%)]" />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-[72%] max-w-[680px] pr-2 sm:left-10 sm:top-[18%] sm:translate-y-0 sm:w-[58%] sm:pr-4 lg:left-14 lg:w-[50%] xl:left-20">
            <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.42em] text-white/78 sm:text-xs">
              From gaming and smart devices to everyday essentials
            </p>
            <h1 className="rusted-heading hero-rusted-title text-[34px] uppercase leading-[0.86] tracking-normal min-[390px]:text-[38px] sm:text-[64px] lg:text-[84px] xl:text-[96px]">
              Everything At
              <br />
              One Destination
            </h1>
            <p className="mt-3 max-w-lg border-b border-[#D71920]/70 pb-3 font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/75 sm:mt-4 sm:text-xs sm:tracking-[0.34em]">
              Smarter gadgets. Better living.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
              <Link href="/products?category=electronic-items" className="inline-flex h-10 min-w-[124px] items-center justify-center bg-[#D71920] px-5 text-[11px] font-black uppercase tracking-wide text-white shadow-xl shadow-[#D71920]/25 hover:bg-white hover:text-black sm:h-11 sm:min-w-[140px] sm:px-6 sm:text-xs">
                Shop Now
              </Link>
              <Link href="/products" className="inline-flex h-10 min-w-[150px] items-center justify-center border border-white/80 bg-black/15 px-5 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-sm hover:bg-white hover:text-black sm:h-11 sm:min-w-[170px] sm:px-6 sm:text-xs">
                Explore Products
              </Link>
            </div>
          </div>

          <a
            href="https://whatsapp.com/channel/0029Vb8uQ4A8fewwkdYGF627"
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#D71920] text-white shadow-[0_0_15px_rgba(215,25,32,0.35)] transition-all duration-300 hover:scale-110 hover:bg-[#FF3B30] hover:shadow-[0_0_25px_rgba(255,59,48,0.7)] bottom-[12%] right-[2%] sm:bottom-[13%] sm:right-[5.8%] sm:h-12 sm:w-12 md:bottom-[13%] md:right-[6.2%] md:h-14 md:w-14"
            style={{ marginRight: "2px", marginBottom: "3px" }}
            aria-label="Join WhatsApp Channel"
          >
            <svg
              className="h-5 w-5 fill-current sm:h-6 sm:w-6 md:h-7 md:w-7"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.004 2C6.48 2 2.004 6.477 2.004 12c0 1.91.534 3.702 1.463 5.237L2 22l4.908-1.287A9.957 9.957 0 0 0 12.004 22c5.522 0 10-4.477 10-10s-4.478-10-10-10zm.005 18c-1.634 0-3.17-.428-4.517-1.184l-.323-.182-3.36.88.897-3.21-.2-.317A7.954 7.954 0 0 1 4.004 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.49-6.162c-.246-.123-1.462-.72-1.69-.8-.227-.08-.393-.122-.558.125-.164.246-.64.8-.785.965-.145.166-.29.186-.537.063a7.567 7.567 0 0 1-1.99-1.23 8.32 8.32 0 0 1-1.378-1.722c-.146-.247-.016-.38.108-.503.11-.11.246-.288.37-.432.124-.144.166-.247.25-.41.08-.166.04-.31-.02-.433-.062-.124-.558-1.348-.765-1.84-.2-.486-.403-.42-.557-.428-.145-.008-.31-.008-.475-.008a.916.916 0 0 0-.662.31c-.227.247-.868.847-.868 2.065 0 1.218.89 2.397.989 2.532.1.134 1.745 2.664 4.227 3.732.59.255 1.05.408 1.41.52.593.19 1.133.162 1.56.098.477-.072 1.462-.597 1.668-1.173.206-.576.206-1.07.145-1.173-.06-.103-.227-.165-.474-.288z" />
            </svg>
            <span className="pointer-events-none absolute bottom-full mb-3 origin-bottom scale-0 rounded bg-black/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xl transition-all duration-200 group-hover:scale-100 whitespace-nowrap border border-white/10">
              Join channel
            </span>
          </a>
        </div>

        <div className="relative z-20 mx-auto mt-3 max-w-[1180px] px-4 sm:mt-4 sm:px-6 lg:-mt-1">
          <div className="mobile-marquee sm:hidden">
            <div className="mobile-marquee-track mobile-marquee-ltr">
              {[...heroBenefits, ...heroBenefits].map((benefit, index) => (
                <div key={`${benefit.title}-${index}`} className="mr-3 flex h-[64px] w-[226px] shrink-0 items-center gap-3 rounded-md border border-[#e8d9d9] bg-white px-4 shadow-[0_12px_28px_rgba(80,24,24,0.10)] dark:border-white/10 dark:bg-[#111]/95">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#D71920] bg-[#D71920]/5 text-[#D71920] dark:bg-transparent">
                    <benefit.icon size={16} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-[13px] uppercase tracking-wide text-[#111] dark:text-white">{benefit.title}</span>
                    <span className="mt-0.5 block text-[10px] font-semibold leading-4 text-[#6b5656] dark:text-white/65">{benefit.subtitle}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden overflow-hidden rounded-md border border-[#e8d9d9] bg-white shadow-[0_18px_42px_rgba(80,24,24,0.12)] dark:border-white/10 dark:bg-[#111]/95 dark:shadow-2xl dark:shadow-black/25 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {heroBenefits.map((benefit) => (
              <div key={benefit.title} className="group flex min-h-[70px] items-center gap-3 border-b border-[#eadede] px-5 py-3 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:[&:nth-child(2n)]:border-r lg:last:border-r-0 dark:border-white/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#D71920] bg-[#D71920]/5 text-[#D71920] transition group-hover:bg-[#D71920] group-hover:text-white dark:bg-transparent dark:group-hover:bg-[#D71920]">
                  <benefit.icon size={17} strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-sm uppercase tracking-wide text-[#111] dark:text-white">{benefit.title}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-[#6b5656] dark:text-white/65">{benefit.subtitle}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg uppercase tracking-wide text-[#111] dark:text-white sm:text-xl">Shop By Category</h2>
          <Link href="/products" className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5c403c] hover:text-[#FF3B30] dark:text-white/70">
            View All Categories <ArrowRight size={12} />
          </Link>
        </div>

        <div className="mobile-marquee -mx-5 sm:hidden">
          <div className="mobile-marquee-track mobile-marquee-ltr px-5">
            {[...categoryTiles, ...categoryTiles].map((category, index) => {
              const Icon = category.icon;
              return (
                <Link key={`${category.label}-${index}`} href={category.href} className="group mr-5 flex w-[76px] shrink-0 flex-col items-center text-center">
                  <span className="relative grid h-[66px] w-[66px] place-items-center overflow-hidden rounded-full bg-[#151515] transition group-hover:scale-105">
                    {category.image ? (
                      <Image src={category.image} alt="" fill sizes="76px" className="object-cover transition group-hover:scale-105" />
                    ) : (
                      <Icon size={25} className="text-white/78 transition group-hover:text-[#FF3B30]" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="mt-2 min-h-8 max-w-[76px] text-[10px] font-black leading-tight text-[#161010] group-hover:text-[#FF3B30] dark:text-white">
                    {category.label}
                  </span>
                  {index === 0 && <span className="mt-1 h-0.5 w-7 bg-[#FF3B30]" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden grid-cols-4 gap-3 sm:grid sm:grid-cols-5 lg:grid-cols-[repeat(9,minmax(0,1fr))] lg:gap-5">
          {categoryTiles.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link key={category.label} href={category.href} className="group flex flex-col items-center text-center">
                <span className="relative grid aspect-square w-full max-w-[74px] place-items-center overflow-hidden rounded-full bg-[#151515] transition group-hover:scale-105">
                  {category.image ? (
                    <Image src={category.image} alt="" fill sizes="90px" className="object-cover transition group-hover:scale-105" />
                  ) : (
                    <Icon size={28} className="text-white/78 transition group-hover:text-[#FF3B30]" strokeWidth={1.5} />
                  )}
                </span>
                <span className="mt-2 min-h-8 max-w-[96px] text-[11px] font-black leading-tight text-[#161010] group-hover:text-[#FF3B30] dark:text-white">
                  {category.label}
                </span>
                {index === 0 && <span className="mt-1 h-0.5 w-7 bg-[#FF3B30]" />}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <PromoCard eyebrow="New Arrivals" title="Just Landed" copy="Explore the latest tech & gadgets" product={promoProducts[0]} fallbackIcon={Watch} />
          <PromoCard eyebrow="Game Sticks" title="Retro Fun" copy="10000+ Games Plug & Play" product={promoProducts[1]} fallbackIcon={Gamepad2} />
          <PromoCard eyebrow="Best Sellers" title="Top Rated" copy="Loved by thousands. Top picks for you" product={promoProducts[2]} fallbackIcon={Headphones} />
        </div>
      </section>

      <CustomOutfitsSection />

      <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF3B30]" />
            <h2 className="font-heading text-xl uppercase tracking-wide text-[#111] dark:text-white">Deals Of The Day</h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#5c403c] dark:text-white/80">
            <span>Ends in:</span>
            <div className="flex gap-1.5">
              {countdown.map(([value, label]) => (
                <span key={label} className="grid h-11 w-11 place-items-center rounded border border-[#fff] bg-white text-center shadow-sm dark:border-white/15 dark:bg-white/[0.03]">
                  <span className="block font-mono text-sm font-black text-[#111] dark:text-white">{value}</span>
                  <span className="-mt-2 block text-[7px] font-bold uppercase text-[#756A6A] dark:text-white/55">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {deals.length ? (
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {deals.map((product, index) => (
                <div key={product.id} className={index > 4 ? "lg:hidden" : ""}>
                  <DealCard product={product} discount={[-32, -25, -18, -22, -22, -20][index] ?? -20} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyVault />
        )}
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg uppercase tracking-wide text-[#111] dark:text-white sm:text-xl">Top Brands</h2>
          <Link href="/products" className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5c403c] hover:text-[#FF3B30] dark:text-white/70">
            View All Brands <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <Link key={brand.name} href={brand.href} className="group grid h-16 place-items-center rounded-md border border-[#e5bdb8] bg-white px-4 text-center shadow-sm transition hover:border-[#FF3B30] dark:border-white/10 dark:bg-white/[0.03]">
              <BrandLogo brand={brand} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg uppercase tracking-wide text-[#111] dark:text-white sm:text-xl">Frequently Asked Questions</h2>
          <Link href="/faq" className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5c403c] hover:text-[#FF3B30] dark:text-white/70">
            View All FAQs <ArrowRight size={12} />
          </Link>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "What is The Grim Store?",
              a: "The Grim Store is a premium, modern e-commerce platform offering carefully curated electronic items, kids instant cameras, retro plug-and-play game sticks, wireless audio gear, grooming tools, and everyday accessories."
            },
            {
              q: "Does The Grim Store offer free shipping?",
              a: "Yes! We offer free standard shipping on all orders above INR 1499. Orders below the threshold are subject to standard delivery charges calculated at checkout."
            },
            {
              q: "What is the return and exchange policy?",
              a: "We offer a flexible 7-day size exchange or store credit return policy. To qualify, products must be returned in their original, unused, and unwashed condition with all packaging and tags intact."
            },
            {
              q: "How can I track my order status?",
              a: "You can track your order in real-time by logging into your account and visiting the 'My Orders' tab. You'll find active status messages and shipping details updated by our team."
            }
          ].map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-md border border-[#e5bdb8] bg-white transition-all duration-300 dark:border-white/10 dark:bg-[#121212]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left font-heading text-xs sm:text-sm uppercase tracking-wide text-[#111] hover:text-[#FF3B30] dark:text-white dark:hover:text-[#FF3B30]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-450 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#FF3B30]" : ""}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-40 border-t border-[#e5bdb8]/45 p-4 dark:border-white/5" : "max-h-0"
                    }`}
                >
                  <p className="text-xs leading-relaxed text-[#5c403c] dark:text-white/60 font-semibold">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-12 sm:px-8 lg:px-12">
        <div className="grid items-center gap-6 rounded-md border border-[#e5bdb8] bg-white p-5 shadow-[0_18px_48px_rgba(80,24,24,0.10)] dark:border-white/10 dark:bg-[#121212] dark:shadow-[0_18px_48px_rgba(0,0,0,0.24)] lg:grid-cols-[1fr_420px_320px]">
          <div>
            <h3 className="font-heading text-base uppercase tracking-wide text-[#111] dark:text-white">Get Exclusive Deals &amp; Updates</h3>
            <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-[#5c403c] dark:text-white/58">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers and more.
            </p>
          </div>
          <form onSubmit={(event) => event.preventDefault()} className="flex h-10 overflow-hidden rounded border border-[#e5bdb8] bg-white dark:border-white/12">
            <input className="min-w-0 flex-1 border-0 !bg-white px-4 text-xs font-semibold !text-[#1a1c1c] outline-none placeholder:text-neutral-400" placeholder="Enter your email address" />
            <button className="bg-[#E31B23] px-5 text-[10px] font-black uppercase text-white hover:bg-[#FF3B30]">
              Subscribe
            </button>
          </form>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              [BadgeCheck, "100% Original", "Products"],
              [LockKeyhole, "Secure", "Shopping"],
              [Mail, "24/7 Customer", "Support"]
            ].map(([Icon, title, copy]) => {
              const FeatureIcon = Icon as typeof BadgeCheck;
              return (
                <div key={title as string} className="grid place-items-center text-[#5c403c] dark:text-white/70">
                  <FeatureIcon size={20} className="text-[#111] dark:text-white" strokeWidth={1.6} />
                  <span className="mt-2 block text-[9px] font-black uppercase leading-tight text-[#111] dark:text-white/72">{title as string}</span>
                  <span className="block text-[9px] font-semibold text-[#756A6A] dark:text-white/42">{copy as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function pickProduct(products: any[], keywords: string[]) {
  if (!products.length) return null;
  const found = products.find((product) => {
    const text = `${product.title ?? ""} ${product.brand ?? ""} ${product.category ?? ""}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword));
  });
  return found ?? products[0];
}

function getProductImage(product: any) {
  if (!product) return "";
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return product.image || product.images?.[0] || variants[0]?.images?.[0] || "";
}

function productSlug(product: any) {
  return product?.slug || product?.id || "";
}

function buildBrandStrip(products: any[]) {
  const configured = new Map<string, { name: string; logo?: string; href: string }>();
  for (const product of products) {
    const meta = product?.brandMeta ?? {};
    const tags = Array.isArray(product?.tags) ? product.tags.map(String) : [];
    const hasBrandTag = tags.some((tag: string) => {
      const key = tag.split(":")[0]?.trim().toLowerCase();
      return ["brandname", "brand-name", "branddisplay", "brandlogo", "brand-logo", "brandimage", "brand-image"].includes(key);
    });
    if (!hasBrandTag && !meta.logo) continue;

    const name = String(meta.name || product?.brand || "").trim();
    if (!name || configured.has(name.toLowerCase())) continue;
    configured.set(name.toLowerCase(), {
      name,
      logo: String(meta.logo || ""),
      href: `/products?brand=${encodeURIComponent(product?.brand || name)}`
    });
  }

  const merged = [...configured.values()];
  for (const brand of defaultBrands) {
    if (merged.length >= 8) break;
    if (!merged.some((item) => item.name.toLowerCase() === brand.name.toLowerCase())) merged.push(brand);
  }
  return merged.slice(0, 8);
}

function BrandLogo({ brand }: { brand: { name: string; logo?: string } }) {
  if (brand.logo) {
    return (
      <span className="flex h-9 w-full max-w-[118px] items-center justify-center">
        <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain opacity-90 transition group-hover:opacity-100" />
      </span>
    );
  }

  const key = brand.name.toLowerCase().replace(/\s+/g, "");
  if (key === "boat") {
    return (
      <span className="font-sans text-[28px] font-light tracking-tight text-[#111] dark:text-white">
        bo<span className="text-[#FF3B30]">A</span>t
      </span>
    );
  }
  if (key === "jbl") return <span className="font-sans text-[24px] font-black tracking-tight text-[#111] dark:text-white">JBL</span>;
  if (key === "sony") return <span className="font-serif text-[21px] font-black tracking-[0.16em] text-[#111] dark:text-white">SONY</span>;
  if (key === "bose") return <span className="skew-x-[-12deg] font-sans text-[19px] font-black italic tracking-[0.08em] text-[#111] dark:text-white">BOSE</span>;
  if (key === "firetv") return <span className="font-sans text-[21px] font-medium lowercase text-[#ff6a21]">fire<span className="text-[#111] dark:text-white">tv</span></span>;
  if (key === "samsung") return <span className="font-sans text-[16px] font-black tracking-[0.12em] text-[#111] dark:text-white">SAMSUNG</span>;
  if (key === "dji") return <span className="font-sans text-[27px] font-black tracking-tight text-[#111] dark:text-white">dji</span>;
  if (key === "apple") return <span className="font-sans text-[22px] font-black tracking-tight text-[#111] dark:text-white">Apple</span>;

  return <span className="font-heading text-xl uppercase tracking-wide text-[#111] group-hover:text-[#FF3B30] dark:text-white/90">{brand.name}</span>;
}

function PromoCard({
  eyebrow,
  title,
  copy,
  product,
  fallbackIcon: FallbackIcon
}: {
  eyebrow: string;
  title: string;
  copy: string;
  product: any;
  fallbackIcon: typeof Watch;
}) {
  const image = getProductImage(product);

  return (
    <Link href={product ? `/products/${productSlug(product)}` : "/products"} className="group relative min-h-[160px] overflow-hidden rounded-md border border-[#e5bdb8] bg-white p-6 shadow-[0_18px_38px_rgba(80,24,24,0.08)] transition hover:border-[#FF3B30] dark:border-white/10 dark:bg-[#111] dark:shadow-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_45%,rgba(227,27,35,0.12),transparent_34%),linear-gradient(120deg,rgba(227,27,35,0.08),rgba(255,255,255,0.82)_42%,rgba(255,255,255,0.55))] dark:bg-[radial-gradient(circle_at_78%_45%,rgba(227,27,35,0.26),transparent_34%),linear-gradient(120deg,rgba(227,27,35,0.14),rgba(255,255,255,0.02)_38%,rgba(0,0,0,0.45))]" />
      {image ? (
        <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-contain object-right p-4 opacity-90 transition group-hover:scale-105 group-hover:opacity-100 dark:opacity-75 dark:group-hover:opacity-95" />
      ) : (
        <FallbackIcon size={92} className="absolute bottom-6 right-8 text-[#111]/10 dark:text-white/16" strokeWidth={1.2} />
      )}
      <div className="relative z-10 max-w-[190px]">
        <p className="font-heading text-sm uppercase tracking-wide text-[#D71920] dark:text-white">{eyebrow}</p>
        <h3 className="mt-2 text-lg font-black text-[#111] dark:text-white">{title}</h3>
        <p className="mt-2 text-xs font-semibold leading-5 text-[#5c403c] dark:text-white/72">{copy}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-xs font-black uppercase text-[#111] group-hover:text-[#FF3B30] dark:text-white">
          Shop Now <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

function CustomOutfitsSection() {
  const add = useCart((state) => state.add);
  const [outfit, setOutfit] = useState(customOutfitOptions[0]);
  const [size, setSize] = useState("M");
  const [quality, setQuality] = useState(customQualities[1]);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function handleAdd() {
    if (!preview) {
      toast.error("Upload the print image first.");
      return;
    }
    const lineId = `custom-outfit:${outfit.key}:${size}:${quality.key}:${Date.now()}`;
    add({
      id: lineId,
      slug: "custom-outfits",
      title: `Custom Printed ${outfit.label}`,
      image: preview,
      brand: "Custom Outfits",
      price: outfit.price,
      salePrice: outfit.price,
      quantity: 1,
      sku: lineId,
      variantKey: quality.key,
      size,
      color: "Custom Print",
      material: quality.label,
      pattern: fileName || "Uploaded Artwork"
    });
    toast.success(`Custom ${outfit.label} added to cart`);
  }

  return (
    <section id="custom-outfits" className="mx-auto max-w-[1440px] scroll-mt-[140px] px-5 pb-10 sm:px-8 lg:px-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-lg uppercase tracking-wide text-[#111] dark:text-white sm:text-xl">Custom Outfits</h2>
        <Link href="#custom-outfits" className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5c403c] hover:text-[#FF3B30] dark:text-white/70">
          Upload Your Design <ArrowRight size={12} />
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-[#e5bdb8] bg-white shadow-[0_18px_48px_rgba(80,24,24,0.10)] dark:border-white/10 dark:bg-[#101010] dark:shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[360px] border-b border-[#e5bdb8] bg-[radial-gradient(circle_at_18%_20%,rgba(227,27,35,0.10),transparent_34%),linear-gradient(135deg,#fff,#f6eeee)] p-6 dark:border-white/10 dark:bg-[radial-gradient(circle_at_18%_20%,rgba(227,27,35,0.22),transparent_34%),linear-gradient(135deg,#161616,#080808)] lg:border-b-0 lg:border-r">
            <div className="relative z-10">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#FF3B30]">Print Your Design</p>
              <h3 className="mt-2 font-heading text-3xl uppercase tracking-wide text-[#111] dark:text-white">Design Your Fit</h3>
              <p className="mt-3 max-w-md text-xs font-semibold leading-5 text-[#5c403c] dark:text-white/60">
                Upload the image you want printed and choose your outfit, size, and print quality.
              </p>
            </div>

            <label className="group/upload relative mt-7 flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-white/12 bg-black text-center transition hover:border-[#FF3B30] sm:min-h-[340px]">
              <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
              <Image
                src="/custom-outfits/design-your-fit-mockup.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition duration-500 group-hover/upload:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-black/10 transition group-hover/upload:bg-black/0" />
              {preview ? (
                <span className="relative z-10 block h-[190px] w-full max-w-[320px] overflow-hidden rounded border border-[#FF3B30]/70 bg-black/75 shadow-2xl shadow-black/50">
                  <img src={preview} alt="Uploaded print preview" className="h-full w-full object-contain p-3" />
                </span>
              ) : (
                <span className="sr-only">Upload print image. PNG, JPG, WEBP supported.</span>
              )}
              <span className="pointer-events-none absolute bottom-4 right-4 z-10 hidden items-center gap-2 rounded bg-black/70 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm transition group-hover/upload:flex">
                <UploadCloud size={14} className="text-[#FF3B30]" />
                Upload Image
              </span>
            </label>
            {fileName && <p className="mt-3 truncate text-[11px] font-semibold text-[#5c403c] dark:text-white/55">{fileName}</p>}
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid gap-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-heading text-base uppercase tracking-wide text-[#111] dark:text-white">Choose Outfit</h3>
                  <span className="text-xs font-black text-[#FF3B30]">{formatMoney(outfit.price, true)}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {customOutfitOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setOutfit(option)}
                      className={`min-h-24 rounded-md border p-4 text-left transition ${outfit.key === option.key ? "border-[#FF3B30] bg-[#FF3B30]/10" : "border-[#e5bdb8] bg-[#fff8f8] hover:border-[#FF3B30] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"}`}
                    >
                      <span className="block font-heading text-lg uppercase text-[#111] dark:text-white">{option.label}</span>
                      <span className="mt-2 block text-sm font-black text-[#FF3B30]">{formatMoney(option.price, true)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-heading text-base uppercase tracking-wide text-[#111] dark:text-white">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {customSizes.map((entry) => (
                    <button
                      key={entry}
                      onClick={() => setSize(entry)}
                      className={`grid h-10 w-12 place-items-center rounded border text-xs font-black transition ${size === entry ? "border-[#FF3B30] bg-[#FF3B30] text-white" : "border-[#e5bdb8] bg-white text-[#5c403c] hover:border-[#FF3B30] dark:border-white/15 dark:bg-white/[0.03] dark:text-white/75"}`}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-heading text-base uppercase tracking-wide text-[#111] dark:text-white">Print Quality</h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  {customQualities.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setQuality(option)}
                      className={`rounded-md border p-3 text-left transition ${quality.key === option.key ? "border-[#FF3B30] bg-[#FF3B30]/10" : "border-[#e5bdb8] bg-[#fff8f8] hover:border-[#FF3B30] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"}`}
                    >
                      <span className="block text-xs font-black uppercase text-[#111] dark:text-white">{option.label}</span>
                      <span className="mt-1 block text-[10px] font-semibold leading-4 text-[#756A6A] dark:text-white/50">{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-md border border-[#e5bdb8] bg-[#fff8f8] p-4 dark:border-white/10 dark:bg-black/25 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#756A6A] dark:text-white/45">Order Summary</p>
                  <p className="mt-1 text-sm font-black text-[#111] dark:text-white">
                    Custom {outfit.label} - {size} - {quality.label}
                  </p>
                </div>
                <button onClick={handleAdd} className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded bg-[#E31B23] px-5 text-xs font-black uppercase text-white hover:bg-[#FF3B30]">
                  <ShoppingBag size={15} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function DealCard({ product, discount }: { product: any; discount: number }) {
  const add = useCart((state) => state.add);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant = variants.find((entry: any) => entry.available !== false && Number(entry.stock ?? 0) > 0) ?? variants[0] ?? null;
  const image = getProductImage(product);
  const salePrice = Number(selectedVariant?.salePrice ?? product.salePrice ?? 0);
  const price = Number(selectedVariant?.price ?? product.price ?? salePrice);
  const rating = Number(product.rating ?? product.ratings?.average ?? 4.8);
  const slug = productSlug(product);

  function handleAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    add({
      id: selectedVariant?.sku ? `${product.id}:${selectedVariant.sku}` : product.id,
      slug,
      title: product.title,
      image: image || "",
      brand: product.brand,
      price,
      salePrice,
      quantity: 1,
      sku: selectedVariant?.sku,
      variantKey: selectedVariant?.sku,
      size: selectedVariant?.size,
      color: selectedVariant?.color
    });
    toast.success(`${product.title} added to cart`);
  }

  return (
    <Link href={`/products/${slug}`} className="group relative overflow-hidden rounded-md border border-[#e5bdb8] bg-white p-3 shadow-md transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#121212] dark:shadow-none">
      <span className="absolute left-10 top-10 z-10 rounded bg-[#E31B23] px-2 py-1 text-[9px] font-black text-white">{discount}%</span>
      <div className="relative aspect-square overflow-hidden rounded bg-[#fff8f8] dark:bg-white/[0.03]">
        {image ? (
          <Image src={image} alt={product.title} fill sizes="(max-width: 1024px) 50vw, 20vw" className="object-contain p-4 transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-[10px] font-black uppercase text-[#756A6A] dark:text-white/35">No Image</div>
        )}
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-2 min-h-8 text-[11px] font-black leading-tight text-[#111] dark:text-white">{product.title}</h3>
        <p className="mt-1 text-[10px] font-semibold text-[#756A6A] dark:text-white/58">{product.brand || "Grim Originals"}</p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={10} fill="currentColor" className={index < Math.round(rating) ? "text-[#D71920]" : "text-[#111]/18 dark:text-white/18"} />
          ))}
          <span className="ml-1 text-[10px] font-bold text-[#756A6A] dark:text-white/48">({rating.toFixed(1)})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-black text-[#111] dark:text-white">{formatMoney(salePrice || price, true)}</span>
          {price > salePrice && <span className="text-[10px] font-semibold text-[#756A6A] line-through dark:text-white/38">{formatMoney(price, true)}</span>}
        </div>
        <button onClick={handleAdd} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded bg-[#E31B23] text-[10px] font-black uppercase text-white hover:bg-[#FF3B30]">
          <ShoppingBag size={13} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

function buildCuratedDrops(products: any[]) {
  const labels = ["Audio // Neckbands", "Game Stick Series", "Kids Cameras", "Accessories"];
  return products.slice(0, 4).map((product, index) => ({
    product,
    title: curatedTitle(product.title, index),
    eyebrow: labels[index] ?? "Vault Drop",
    image: product.image || product.images?.[0] || product.variants?.[0]?.images?.[0]
  }));
}

function curatedTitle(title: string, index: number) {
  const lower = title.toLowerCase();
  if (lower.includes("camera")) return "Kids Camera Picks";
  if (lower.includes("game") || lower.includes("gs 5")) return "Game Stick Picks";
  if (lower.includes("headphone") || lower.includes("speaker") || lower.includes("neckband")) return "Audio Essentials";
  if (index === 0) return "Electronic Essentials";
  return title;
}

function EmptyVault() {
  return (
    <div className="grid min-h-72 place-items-center border border-dashed border-[#e5bdb8] bg-white p-10 text-center dark:border-[#3a1f1f] dark:bg-[#130b0b]">
      <div>
        <PackageOpen className="mx-auto text-[#FF3B30]" size={34} />
        <h3 className="mt-4 font-heading text-xl uppercase tracking-wide">No products loaded</h3>
        <p className="mt-2 max-w-sm text-sm text-[#5c403c] dark:text-white/60">
          Start the API/database connection to render the live 21-product catalog here.
        </p>
      </div>
    </div>
  );
}

function VaultProductCard({ product }: { product: any }) {
  const add = useCart((state) => state.add);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant = variants.find((entry: any) => entry.available !== false && Number(entry.stock ?? 0) > 0) ?? null;
  const image = selectedVariant?.images?.[0] || product.image || product.images?.[0];
  const salePrice = Number(selectedVariant?.salePrice ?? product.salePrice ?? 0);
  const price = Number(selectedVariant?.price ?? product.price ?? salePrice);
  const slug = product.slug || product.id;

  function handleAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    add({
      id: selectedVariant?.sku ? `${product.id}:${selectedVariant.sku}` : product.id,
      slug,
      title: product.title,
      image: image || "",
      brand: product.brand,
      price,
      salePrice,
      quantity: 1,
      sku: selectedVariant?.sku,
      variantKey: selectedVariant?.sku,
      size: selectedVariant?.size,
      color: selectedVariant?.color
    });
    toast.success(`${product.title} added to cart`);
  }

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeeee] dark:bg-[#120909]">
        {image ? (
          <Image src={image} alt={product.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-110" />
        ) : (
          <div className="grid h-full place-items-center text-center font-mono text-[10px] font-black uppercase tracking-widest text-[#5c403c] dark:text-white/45">No Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <button
          onClick={handleAdd}
          className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 bg-white px-5 py-2 text-[10px] font-black uppercase tracking-wider text-black opacity-0 transition hover:bg-[#FF3B30] hover:text-white group-hover:opacity-100"
        >
          <ShoppingBag size={12} />
          Quick Add
        </button>
        <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center bg-black/55 text-white backdrop-blur-sm transition hover:bg-[#FF3B30]" aria-label="Wishlist">
          <Heart size={14} />
        </button>
      </div>
      <div className="mt-4">
        <h3 className="line-clamp-2 min-h-9 font-mono text-xs font-black uppercase tracking-wide text-[#1a1c1c] dark:text-white">{product.title}</h3>
        <p className="mt-1 flex items-center gap-2 text-sm font-black text-[#FF3B30]">
          {formatMoney(salePrice || price, true)}
          <ArrowRight size={13} />
        </p>
      </div>
    </Link>
  );
}

