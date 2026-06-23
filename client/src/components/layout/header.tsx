"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Box,
  Camera,
  Car,
  ChevronDown,
  CircleHelp,
  Download,
  Flame,
  Gamepad2,
  Gift,
  Grid2X2,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  MapPin,
  Menu,
  Mic,
  Monitor,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Speaker,
  Moon,
  Sun,
  Truck,
  User,
  Watch,
  X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useFlyCartStore } from "@/store/fly-cart";
import { useTheme } from "@/components/theme-provider";

type SearchSuggestion = {
  id: string;
  title: string;
  brand?: string;
  category?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://the-grim-store.onrender.com/api/v1";

const primaryNav = [
  { label: "Electronic Items", href: "/products?category=electronic-items" },
  { label: "Game Sticks", href: "/products?q=game" },
  { label: "New Arrivals", href: "/products?sort=latest", isNew: true },
  { label: "Custom Outfits", href: "/#custom-outfits" }
];

const utilityLinks = [
  { label: "Track Order", href: "/account?tab=orders", icon: PackageCheck },
  { label: "Help Center", href: "/contact-us", icon: CircleHelp },
  { label: "Returns & Refunds", href: "/returns-and-exchange-policy", icon: RotateCcw },
  { label: "Gift Cards", href: "/products?sort=latest", icon: Gift },
  { label: "Sell on Innovate", href: "/contact-us" }
];

const categoryRail = [
  { label: "Smart Wearables", href: "/products?q=smartwatch", icon: Watch },
  { label: "Audio & Headphones", href: "/products?q=headphone", icon: Headphones, active: true },
  { label: "Mobile Accessories", href: "/products?q=mobile", icon: Smartphone },
  { label: "Gaming & Consoles", href: "/products?q=game", icon: Gamepad2 },
  { label: "Home Entertainment", href: "/products?q=speaker", icon: Speaker },
  { label: "Computer & Accessories", href: "/products?q=computer", icon: Monitor },
  { label: "Smart Home Devices", href: "/products?q=smart", icon: Home },
  { label: "Drones & Cameras", href: "/products?q=camera", icon: Camera },
  { label: "Car Accessories", href: "/products?q=car", icon: Car },
  { label: "Health & Fitness", href: "/products?q=fitness", icon: HeartPulse },
  { label: "Toys & Collectibles", href: "/products?q=toy", icon: Box },
  { label: "Custom Outfits", href: "/#custom-outfits", icon: ShoppingBag },
  { label: "Deals & Offers", href: "/products?sort=popular", icon: BadgePercent }
];

const audioMenu = [
  { title: "Headphones", desc: "Over-ear, on-ear, in-ear", icon: Headphones },
  { title: "Earbuds", desc: "Wireless, premium sound", icon: Smartphone },
  { title: "Speakers", desc: "Portable, Bluetooth, smart", icon: Speaker },
  { title: "Soundbars", desc: "Immersive home audio", icon: Box },
  { title: "Microphones", desc: "Studio, gaming, podcast", icon: Mic },
  { title: "Audio Accessories", desc: "Cables, adapters, cases", icon: Headphones },
  { title: "Gaming Headsets", desc: "Surround sound, mic", icon: Gamepad2 },
  { title: "Noise Cancelling", desc: "Focus on what matters", icon: ShieldCheck },
  { title: "Bluetooth Speakers", desc: "Powerful & portable", icon: Speaker },
  { title: "DJ & Studio Equipment", desc: "Pro audio gear", icon: Mic },
  { title: "Hi-Fi Audio", desc: "High fidelity sound", icon: Headphones },
  { title: "Refurbished Audio", desc: "Quality checked, great deals", icon: RefreshCw }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [condensed, setCondensed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const cartRef = useRef<HTMLAnchorElement>(null);
  const setCartIconRect = useFlyCartStore((state) => state.setCartIconRect);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/products/suggestions?q=${encodeURIComponent(query)}&limit=8`, {
          credentials: "include",
          signal: controller.signal
        });
        if (!response.ok) return;
        const data = await response.json();
        setSearchSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch {
        if (!controller.signal.aborted) setSearchSuggestions([]);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    function updateRect() {
      if (cartRef.current) setCartIconRect(cartRef.current.getBoundingClientRect());
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [setCartIconRect]);

  useEffect(() => {
    function onScroll() {
      setCondensed(window.scrollY > 42);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    performSearch(searchQuery);
  }

  function performSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/products?q=${encodeURIComponent(query)}`);
  }

  if (pathname.startsWith("/checkout")) return null;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#e8d9d9] bg-white text-[#111111] shadow-[0_14px_38px_rgba(80,24,24,0.12)] dark:border-white/10 dark:bg-[#050505] dark:text-white dark:shadow-[0_18px_44px_rgba(0,0,0,0.35)]">
        <div className="hidden lg:block">
          <div className="border-b border-[#eadede] bg-[#fbf8f8] dark:border-white/10 dark:bg-[#050505]">
            <div className="mx-auto flex h-7 max-w-[1480px] items-center justify-between px-6 text-[10px] font-semibold text-[#4c3838] dark:text-white/82">
              <Link href="/contact-us" className="inline-flex items-center gap-1.5 hover:text-[#FF3B30]">
                <MapPin size={13} />
                Deliver to New York 10001
              </Link>
              <div className="flex items-center gap-7">
                {utilityLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                  <Link key={item.label} href={item.href} className="inline-flex items-center gap-1.5 hover:text-[#FF3B30]">
                      {Icon && <Icon size={12} />}
                      {item.label}
                    </Link>
                  );
                })}
                <Link href="/products?sort=popular" className="inline-flex items-center gap-1.5 text-[#FF3B30]">
                  <Flame size={12} fill="currentColor" />
                  Deals of the Day
                </Link>
                <Link href="/contact-us" className="inline-flex items-center gap-1.5 hover:text-[#FF3B30]">
                  <Download size={12} />
                  Download App
                </Link>
                <button className="inline-flex items-center gap-2 hover:text-[#FF3B30]" aria-label="Language">
                  <span className="text-xs">🇺🇸</span>
                  EN
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#070707]">
            <div className={`mx-auto grid max-w-[1480px] grid-cols-[210px_minmax(340px,1fr)_318px] items-center gap-6 px-6 transition-all duration-300 ${condensed ? "h-[56px]" : "h-[64px]"}`}>
              <Link href="/" className="relative flex items-center gap-2.5 overflow-visible" aria-label="The Grim Store home">
                <span className="relative -my-3 grid h-[76px] w-[70px] place-items-center overflow-visible">
                  <img src="/logo.png" alt="" className="h-full w-full object-contain object-center drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]" aria-hidden="true" />
                </span>
                <span className="grim-wordmark grim-wordmark-inline text-[24px]" aria-hidden="true">
                  <span className="grim-wordmark-kicker">The</span>
                  <span>Grim</span>
                  <span>Store</span>
                </span>
              </Link>

              <form onSubmit={submitSearch} className="flex h-10 overflow-hidden rounded-md border border-white/10 !bg-white text-black shadow-[0_8px_28px_rgba(255,255,255,0.05)]">
                <button type="button" className="flex min-w-[148px] items-center justify-between border-r border-black/10 !bg-white px-4 text-[11px] font-semibold text-[#1a1c1c]">
                  All Categories
                  <ChevronDown size={14} />
                </button>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="min-w-0 flex-1 border-0 !bg-white px-4 text-[11px] font-semibold !text-[#1a1c1c] outline-none placeholder:text-neutral-400"
                  placeholder="Search gadgets, game sticks, headphones, smart tech..."
                />
                <button type="submit" className="grid w-14 place-items-center bg-[#E31B23] text-white hover:bg-[#FF3B30]" aria-label="Search products">
                  <Search size={21} strokeWidth={2.2} />
                </button>
              </form>

              <div className="flex items-center justify-end gap-4">
                <div className="relative group/profile">
                  <Link href="/account" className="flex items-center gap-3 text-[#111111] hover:text-[#FF3B30] dark:text-white">
                    <User size={22} strokeWidth={1.8} />
                    <span className="text-left text-[10px] font-semibold leading-tight">
                      <span className="block text-[#5f4a4a] dark:text-white/82">{user ? `Hello, ${user.name || "Customer"}` : "Hello, Sign in"}</span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#111111] dark:text-white">
                        My Account <ChevronDown size={12} />
                      </span>
                    </span>
                  </Link>
                  <div className="invisible absolute right-0 top-full z-[170] mt-4 w-64 border border-[#e8d9d9] bg-white p-5 text-left text-[#111111] opacity-0 shadow-[0_24px_48px_rgba(80,24,24,0.16)] transition-all group-hover/profile:visible group-hover/profile:opacity-100 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white dark:shadow-2xl">
                    {user ? (
                      <>
                        <div className="border-b border-[#eadede] pb-4 dark:border-white/10">
                          <h3 className="font-heading text-xs uppercase tracking-wide">Hello {user.name || "Customer"}</h3>
                          <p className="mt-1 truncate text-[11px] text-[#756666] dark:text-white/55">{user.email}</p>
                        </div>
                        <button
                          onClick={async () => {
                            await logout();
                            window.location.href = "/";
                          }}
                          className="mt-4 text-xs font-black uppercase tracking-wider text-[#FF3B30]"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link href="/login" className="inline-flex h-10 w-full items-center justify-center bg-[#FF3B30] text-xs font-black uppercase tracking-wider text-white">
                        Login / Signup
                      </Link>
                    )}
                    <div className="mt-4 flex flex-col gap-3 border-t border-[#eadede] pt-4 text-xs font-bold dark:border-white/10">
                      <Link href="/account?tab=orders" className="text-[#5f4a4a] hover:text-[#FF3B30] dark:text-white/70">My Orders</Link>
                      <Link href="/wishlist" className="text-[#5f4a4a] hover:text-[#FF3B30] dark:text-white/70">Wishlist</Link>
                      <Link href="/account?tab=addresses" className="text-[#5f4a4a] hover:text-[#FF3B30] dark:text-white/70">Saved Addresses</Link>
                    </div>
                  </div>
                </div>

                <Link href="/wishlist" className="relative flex items-center gap-2 text-[#111111] hover:text-[#FF3B30] dark:text-white" aria-label="Wishlist">
                  <Heart size={23} strokeWidth={1.8} />
                  <span className="text-[10px] font-bold">Wishlist</span>
                  <span className="absolute -right-2.5 -top-2.5 grid h-4 w-4 place-items-center rounded-full bg-[#E31B23] text-[9px] font-black text-white">0</span>
                </Link>
                <Link ref={cartRef} href="/cart" className="relative flex items-center gap-2 text-[#111111] hover:text-[#FF3B30] dark:text-white" aria-label="Cart">
                  <ShoppingBag size={24} strokeWidth={1.8} />
                  <span className="text-[10px] font-bold">Cart</span>
                  <span className="absolute -right-3.5 -top-2.5 grid h-4 w-4 place-items-center rounded-full bg-[#E31B23] text-[9px] font-black text-white">{cartCount}</span>
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#e3d0d0] bg-white text-[#111111] hover:border-[#FF3B30] hover:text-[#FF3B30] dark:border-white/15 dark:bg-transparent dark:text-white"
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  title={theme === "dark" ? "Light mode" : "Dark mode"}
                >
                  {theme === "dark" ? <Sun size={17} strokeWidth={1.9} /> : <Moon size={17} strokeWidth={1.9} />}
                </button>
              </div>
            </div>
          </div>

          <div className="group/mega relative border-t border-[#eadede] bg-white dark:border-white/10 dark:bg-[#090909]">
            <nav className="mx-auto flex h-9 max-w-[1480px] items-stretch px-6" aria-label="Primary">
              <button className="flex w-[192px] items-center gap-2.5 bg-[#E31B23] px-4 text-[11px] font-black uppercase text-white">
                <Menu size={15} />
                All Categories
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-between border-b border-[#eadede] bg-white px-5 dark:border-white/10 dark:bg-[#0B0B0B]">
                {[
                  ["Electronic Items", "/products?category=electronic-items", true],
                  ["Game Sticks", "/products?q=game", true],
                  ["New Arrivals", "/products?sort=latest", true],
                  ["Best Sellers", "/products?sort=popular", false],
                  ["Brands", "/products?brand=Grim%20Originals", true],
                  ["Accessories", "/products?q=accessories", true],
                  ["Blog", "/about-us", true],
                  ["Contact Us", "/contact-us", false]
                ].map(([label, href, hasChevron]) => (
                  <Link key={label as string} href={href as string} className="inline-flex h-full items-center gap-1 text-[10px] font-black uppercase text-[#111111] hover:text-[#FF3B30] dark:text-white">
                    <span className={label === "New Arrivals" ? "underline underline-offset-4" : ""}>{label}</span>
                    {label === "New Arrivals" && <span className="rounded-full bg-[#E31B23] px-1.5 py-0.5 text-[7px] text-white">New</span>}
                    {hasChevron && <ChevronDown size={11} />}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="invisible absolute left-1/2 top-full z-[155] w-[calc(100vw-48px)] max-w-[1430px] -translate-x-1/2 border border-[#e3d0d0] bg-white/96 opacity-0 shadow-[0_28px_70px_rgba(80,24,24,0.18)] backdrop-blur-md transition group-hover/mega:visible group-hover/mega:opacity-100 dark:border-white/12 dark:bg-[#0A0D0F]/96 dark:shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
              <div className="grid min-h-[286px] grid-cols-[192px_minmax(470px,1fr)_420px]">
                <aside className="border-r border-[#eadede] bg-[#fbf8f8] dark:border-white/10 dark:bg-white/[0.04]">
                  {categoryRail.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href} className={`flex h-[23px] items-center gap-2 px-4 text-[11px] font-semibold ${item.active ? "text-[#FF3B30]" : "text-[#352626] hover:text-[#FF3B30] dark:text-white/88"}`}>
                        <Icon size={12} strokeWidth={1.7} />
                        {item.label}
                      </Link>
                    );
                  })}
                </aside>

                <div className="px-6 py-4">
                  <h3 className="font-heading text-sm uppercase tracking-wide text-[#FF3B30]">Audio &amp; Headphones</h3>
                  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
                    {audioMenu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.title} href={`/products?q=${encodeURIComponent(item.title)}`} className="group/item flex gap-2.5">
                          <Icon size={18} className="mt-0.5 shrink-0 text-[#5f4a4a] group-hover/item:text-[#FF3B30] dark:text-white/82" strokeWidth={1.5} />
                          <span>
                            <span className="block text-[11px] font-black text-[#111111] group-hover/item:text-[#FF3B30] dark:text-white">{item.title}</span>
                            <span className="mt-0.5 block text-[10px] font-semibold text-[#756666] dark:text-white/58">{item.desc}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="border-l border-[#eadede] p-4 dark:border-white/10">
                  <Link href="/products?q=headphones" className="relative block h-[176px] overflow-hidden rounded-md border border-[#e3d0d0] bg-[radial-gradient(circle_at_72%_40%,rgba(227,27,35,0.16),transparent_36%),linear-gradient(120deg,#ffffff,#fff7f7)] p-5 dark:border-white/12 dark:bg-[radial-gradient(circle_at_72%_40%,rgba(227,27,35,0.34),transparent_35%),linear-gradient(120deg,#111,#1a0809)]">
                    <div className="relative z-10 max-w-[185px]">
                      <p className="font-heading text-base uppercase text-[#111111] dark:text-white">Premium Sound</p>
                      <p className="mt-0.5 font-heading text-base uppercase text-[#FF3B30]">Perfected</p>
                      <p className="mt-3 text-[11px] font-semibold leading-4 text-[#4c3838] dark:text-white/82">Up to 40% Off on<br />Top Audio Brands</p>
                      <span className="mt-3 inline-flex h-8 min-w-[108px] items-center justify-center border border-[#111111]/70 text-[10px] font-black uppercase text-[#111111] hover:border-[#FF3B30] hover:bg-[#FF3B30] hover:text-white dark:border-white/70 dark:text-white">
                        Shop Now
                      </span>
                    </div>
                    <Headphones size={132} className="absolute bottom-2 right-7 text-[#111111]/10 dark:text-white/18" strokeWidth={1.1} />
                  </Link>
                  <div className="mt-2.5 grid grid-cols-3 gap-0 overflow-hidden rounded-md border border-[#e3d0d0] dark:border-white/12">
                    {[
                      [Truck, "Free Shipping", "On all orders over $50"],
                      [ShieldCheck, "1 Year Warranty", "On selected products"],
                      [RefreshCw, "Easy Returns", "30-day return policy"]
                    ].map(([Icon, title, desc]) => {
                      const FeatureIcon = Icon as typeof Truck;
                      return (
                        <div key={title as string} className="flex min-h-[54px] items-center gap-2 border-r border-[#eadede] px-2.5 last:border-r-0 dark:border-white/10">
                          <FeatureIcon size={18} className="shrink-0 text-[#111111] dark:text-white" strokeWidth={1.6} />
                          <span>
                            <span className="block text-[10px] font-black text-[#111111] dark:text-white">{title as string}</span>
                            <span className="mt-0.5 block text-[8px] font-semibold text-[#756666] dark:text-white/62">{desc as string}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex h-[78px] items-center justify-between border-b border-[#e8d9d9] bg-white px-2 min-[360px]:px-3 min-[400px]:px-4 text-[#111111] dark:border-white/10 dark:bg-[#050505] dark:text-white lg:hidden" aria-label="Mobile primary">
          <button
            className="grid h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 min-[400px]:h-10 min-[400px]:w-10 place-items-center border border-[#e3d0d0] dark:border-white/15"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} className="min-[360px]:w-[18px] min-[360px]:h-[18px] min-[400px]:w-[20px] min-[400px]:h-[20px]" />
          </button>
          <Link href="/" className="relative flex items-center gap-1 min-[360px]:gap-1.5 min-[400px]:gap-2 overflow-visible" aria-label="The Grim Store home">
            <span className="relative -my-3 h-[48px] w-[48px] min-[360px]:h-[56px] min-[360px]:w-[56px] min-[400px]:h-[66px] min-[400px]:w-[66px] overflow-visible">
              <video src="/logo1.mp4" className="h-full w-full object-contain" autoPlay muted loop playsInline aria-hidden="true" />
            </span>
            <span className="grim-wordmark grim-wordmark-inline text-[12px] min-[350px]:text-[14px] min-[375px]:text-[16px] min-[400px]:text-[18px] min-[440px]:text-[20px]" aria-hidden="true">
              <span className="grim-wordmark-kicker">The</span>
              <span>Grim</span>
              <span>Store</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 min-[360px]:gap-1.5 min-[400px]:gap-2">
            <button onClick={() => setSearchOpen(true)} className="grid h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 min-[400px]:h-10 min-[400px]:w-10 place-items-center border border-[#e3d0d0] dark:border-white/15" aria-label="Search">
              <Search size={15} className="min-[360px]:w-[16px] min-[360px]:h-[16px] min-[400px]:w-[18px] min-[400px]:h-[18px]" />
            </button>
            <Link ref={cartRef} href="/cart" className="relative grid h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 min-[400px]:h-10 min-[400px]:w-10 place-items-center border border-[#e3d0d0] dark:border-white/15" aria-label="Cart">
              <ShoppingBag size={16} className="min-[360px]:w-[18px] min-[360px]:h-[18px] min-[400px]:w-[20px] min-[400px]:h-[20px]" />
              <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 min-[360px]:min-h-5 min-[360px]:min-w-5 place-items-center rounded-full bg-[#E31B23] px-1 text-[8px] min-[360px]:text-[10px] font-black leading-none text-white">
                {cartCount}
              </span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 min-[400px]:h-10 min-[400px]:w-10 place-items-center border border-[#e3d0d0] text-[#111111] hover:border-[#FF3B30] hover:text-[#FF3B30] dark:border-white/15 dark:text-white"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={15} className="min-[360px]:w-[16px] min-[360px]:h-[16px] min-[400px]:w-[18px] min-[400px]:h-[18px]" /> : <Moon size={15} className="min-[360px]:w-[16px] min-[360px]:h-[16px] min-[400px]:w-[18px] min-[400px]:h-[18px]" />}
            </button>
          </div>
        </nav>
      </header>

      <div className="h-[78px] bg-[#f9f9f9] dark:bg-[#0A0A0A] lg:h-[127px]" aria-hidden="true" />

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[170] bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}>
            <motion.aside
              initial={{ translateX: "-100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="flex h-full w-[84vw] max-w-xs flex-col border-r border-[#e3d0d0] bg-white p-5 text-[#111111] shadow-2xl dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#eadede] pb-4 dark:border-white/10">
                <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-[#111111] dark:text-white">
                  <span className="relative h-8 w-8 overflow-hidden rounded bg-white">
                    <video src="/logo1.mp4" className="h-full w-full object-cover" autoPlay muted loop playsInline aria-hidden="true" />
                  </span>
                  <span className="grim-wordmark grim-wordmark-inline text-[18px]">
                    <span className="grim-wordmark-kicker">The</span>
                    <span>Grim</span>
                    <span>Store</span>
                  </span>
                </Link>
                <button onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center border border-[#e3d0d0] dark:border-white/15" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 flex-1 overflow-y-auto">
                <p className="px-1 text-[10px] font-black uppercase tracking-widest text-[#FF3B30]">Shop</p>
                <div className="mt-2 flex flex-col">
                  {primaryNav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="border-b border-[#eadede] px-1 py-4 text-xs font-black uppercase tracking-wider text-[#352626] hover:text-[#FF3B30] dark:border-white/10 dark:text-white/85"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            query={searchQuery}
            suggestions={searchSuggestions}
            onChange={setSearchQuery}
            onClose={() => setSearchOpen(false)}
            onSubmit={submitSearch}
            onPick={performSearch}
          />
        )}
      </AnimatePresence>

      <nav
        className="fixed inset-x-0 bottom-0 z-[120] border-t border-[#e8d9d9] bg-white/96 px-4 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 text-[#6a6262] shadow-[0_-8px_28px_rgba(80,24,24,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-[#080808]/96 dark:text-white/58 lg:hidden"
        aria-label="Mobile bottom tabs"
      >
        <div className="mx-auto grid h-[52px] max-w-[430px] grid-cols-4 items-center">
          <MobileBottomTab href="/" label="Home" icon={Home} active={pathname === "/"} />
          <MobileBottomTab href="/products" label="Categories" icon={Grid2X2} active={pathname.startsWith("/products")} />
          <MobileBottomTab href="/account" label="Account" icon={User} active={pathname.startsWith("/account") || pathname.startsWith("/login")} />
          <MobileBottomTab href="/cart" label="Cart" icon={ShoppingBag} active={pathname.startsWith("/cart")} badge={cartCount} />
        </div>
      </nav>
    </>
  );
}

function MobileBottomTab({
  href,
  label,
  icon: Icon,
  active,
  badge
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex h-full min-w-0 flex-col items-center justify-center gap-0.5 text-center transition active:scale-95 ${
        active ? "text-[#0b63f6] dark:text-[#FF3B30]" : "hover:text-[#111] dark:hover:text-white"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="relative grid h-6 w-8 place-items-center">
        <Icon size={22} strokeWidth={active ? 2.7 : 2.1} className={active && label === "Home" ? "fill-current" : ""} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#E31B23] px-1 text-[8px] font-black leading-none text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="max-w-full truncate text-[10px] font-bold leading-none">{label}</span>
    </Link>
  );
}

function SearchOverlay({
  query,
  suggestions,
  onChange,
  onClose,
  onSubmit,
  onPick
}: {
  query: string;
  suggestions: SearchSuggestion[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (value: string) => void;
  onPick: (value: string) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fallback: SearchSuggestion[] = [
    { id: "camera", title: "Instant Print Camera", brand: "Camera" },
    { id: "game", title: "Game Stick", brand: "Gaming" },
    { id: "headphone", title: "Wireless Headphones", brand: "Audio" },
    { id: "trimmer", title: "Kemei Trimmer", brand: "Grooming" },
    { id: "dongle", title: "USB Bluetooth Dongle", brand: "Accessories" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
      <motion.div
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="mt-20 w-full max-w-2xl border border-white/10 bg-[#0A0A0A] p-5 text-white shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <form onSubmit={onSubmit} className="flex min-h-12 flex-1 items-center border border-white/15 bg-white/5 px-4 focus-within:border-[#FF3B30]">
            <Search size={18} className="shrink-0 text-[#FF3B30]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Search gadgets, game sticks, headphones..."
              className="ml-3 min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35"
            />
          </form>
          <button onClick={onClose} aria-label="Close search" className="grid h-12 w-12 place-items-center border border-white/15 bg-white/5 text-white">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <h4 className="mb-3 px-1 font-mono text-[10px] font-black uppercase tracking-widest text-[#FF3B30]">
            {query.trim().length >= 2 ? "Search Results" : "Trending Searches"}
          </h4>
          <div className="grid gap-2">
            {(suggestions.length ? suggestions : fallback).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onPick(suggestion.title)}
                className="group flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-left hover:border-[#FF3B30]/50"
              >
                <span>
                  <span className="block text-xs font-black text-white group-hover:text-[#FF3B30]">{suggestion.title}</span>
                  <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider text-white/45">
                    {[suggestion.brand, suggestion.category].filter(Boolean).join(" / ") || "Popular Category"}
                  </span>
                </span>
                <ArrowRight size={14} className="text-white/35 group-hover:text-[#FF3B30]" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
