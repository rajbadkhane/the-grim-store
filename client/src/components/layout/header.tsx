"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronRight, Heart, Menu, Search, ShoppingBag, User, X, Zap, Sparkles, Cpu, Sun, Moon, Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useFlyCartStore } from "@/store/fly-cart";
import { useTheme } from "@/components/theme-provider";

type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
};

type SearchSuggestion = {
  id: string;
  title: string;
  brand?: string;
  category?: string;
};

type Particle = {
  id: string;
  angle: number;
  speed: number;
  color: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCategories, setLiveCategories] = useState<HeaderCategory[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const router = useRouter();
  const cartRef = useRef<HTMLDivElement>(null);
  const setCartIconRect = useFlyCartStore((state) => state.setCartIconRect);
  const arrivalTriggered = useFlyCartStore((state) => state.arrivalTriggered);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setCompact(latest > 28);
    setHidden(latest > 120 && latest > previous);
  });

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/products/categories`, { credentials: "include", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        setLiveCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        setLiveCategories([]);
      }
    }
    loadCategories();
    return () => controller.abort();
  }, []);

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
    }, 160);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    let frame = 0;
    function updateRect() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (cartRef.current) setCartIconRect(cartRef.current.getBoundingClientRect());
      });
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [setCartIconRect]);

  useEffect(() => {
    if (arrivalTriggered === 0) return;
    const newParticles: Particle[] = Array.from({ length: 16 }).map((_, i) => ({
      id: `${arrivalTriggered}-${i}-${Math.random()}`,
      angle: (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.32,
      speed: 2 + Math.random() * 4,
      color: ["#3B82F6", "#A855F7", "#7C3AED", "#ffffff"][Math.floor(Math.random() * 4)]
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  }, [arrivalTriggered]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch(searchQuery);
  }

  function performSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    setSearchQuery(query);
    setOpen(false);
    setSearchOpen(false);
    router.push(`/products?q=${encodeURIComponent(query)}`);
  }

  const categories = liveCategories.length ? liveCategories : [{ id: "all", name: "All Products", slug: "" }];
  const mobileLinks = [
    { label: "Catalog", href: "/products" },
    ...liveCategories.slice(0, 4).map((category) => ({ label: category.name, href: `/products?category=${category.slug}` })),
    { label: "Wishlist", href: "/wishlist" },
    { label: "Orders", href: "/account?tab=orders" }
  ];

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -130 : 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 px-3 pt-2 w-full flex flex-col gap-2"
      >
        {/* Top Announcement Strip */}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-xl bg-slate-900/90 dark:bg-black/95 px-4 py-1.5 text-[10px] sm:text-xs font-black text-white/90 shadow-sm border border-neutral-200/5 dark:border-neutral-900/40 backdrop-blur-md">
          <div className="flex-1 text-center truncate tracking-wide">
            <span>🌐 Welcome to <strong className="text-indigo-400">thegrimstore.com</strong> | ⚡ LAUNCH OFFER: Use code <strong className="text-yellow-400">GRIM40</strong> for 40% off on premium gadgets!</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 ml-2">
            <Link href="/account?tab=orders" className="bg-indigo-650 hover:bg-indigo-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded text-white transition select-none">
              Track Order
            </Link>
          </div>
        </div>

        <div
          className={`mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-electrox-elevated/42 bg-electrox-bg/78 px-4 backdrop-blur-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_22px_70px_rgba(0,0,0,0.42)] ${
            compact ? "h-14" : "h-18"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-electrox-elevated/50 bg-electrox-surface text-sm font-black text-foreground shadow-sm">
              <Cpu size={18} className="text-electrox-blue dark:text-white" />
            </span>
            <span className="leading-none">
              <span className="block text-sm font-black uppercase tracking-[0.24em] text-foreground">The Grim</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.34em] text-neutral-400 dark:text-neutral-450 group-hover:text-electrox-blue">Store</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-bold text-neutral-450 dark:text-slate-350 lg:flex">
            <NavLink href="/products">Catalog</NavLink>
            <div className="group relative py-5">
              <button className="rounded-full px-4 py-2 transition hover:bg-electrox-elevated hover:text-foreground">Categories</button>
              <div className="invisible absolute left-1/2 top-16 grid w-[760px] -translate-x-1/2 grid-cols-3 gap-3 rounded-2xl border border-electrox-elevated/70 bg-electrox-surface/98 p-4 opacity-0 shadow-xl backdrop-blur-2xl transition group-hover:visible group-hover:opacity-100">
                {categories.slice(0, 9).map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.slug ? `/products?category=${item.slug}` : "/products"}
                    className="group/item rounded-2xl border border-electrox-elevated/40 bg-electrox-bg-2 p-4 transition hover:-translate-y-0.5 hover:border-electrox-blue/60 hover:bg-electrox-blue/5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-foreground">{item.name}</span>
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-electrox-elevated text-electrox-blue font-mono text-xs">
                        {index + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-neutral-450">Verified inventory and fast dispatch checkout.</p>
                  </Link>
                ))}
              </div>
            </div>
            <NavLink href="/products?sort=popular">Trending</NavLink>
            <NavLink href="/account?tab=orders">Orders</NavLink>
          </nav>

          <div className="hidden w-full max-w-sm items-center rounded-full border border-electrox-elevated/60 bg-electrox-bg-2 px-3 py-2 lg:flex">
            <Search size={17} className="text-neutral-450" />
            <button onClick={() => setSearchOpen(true)} className="ml-2 flex-1 text-left text-sm font-medium text-neutral-450">
              Search phones, audio, gadgets...
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button aria-label="Search products" onClick={() => setSearchOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-neutral-450 hover:bg-electrox-elevated hover:text-foreground lg:hidden">
              <Search size={19} />
            </button>
            
            {/* Theme Toggle Button */}
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-full text-neutral-450 hover:bg-electrox-elevated hover:text-foreground transition duration-200"
            >
              {theme === "dark" ? <Sun size={19} className="text-amber-500" /> : <Moon size={19} className="text-slate-600" />}
            </button>

            <IconLink href="/account" label="Account">
              <User size={19} />
            </IconLink>
            <IconLink href="/wishlist" label="Wishlist">
              <Heart size={19} />
            </IconLink>
            <motion.div ref={cartRef} className="relative" animate={{ scale: arrivalTriggered ? [1, 1.18, 1] : 1 }} transition={{ duration: 0.42 }}>
              <Link aria-label="Cart" href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full border border-electrox-blue/20 bg-electrox-blue/10 text-electrox-blue hover:border-electrox-blue/50 hover:shadow-sm">
                <ShoppingBag size={19} />
                {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-1.5 py-0.5 text-[10px] font-black text-white">{cartCount}</span>}
              </Link>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                {particles.map((p) => (
                  <FlyingParticle key={p.id} particle={p} onComplete={() => setParticles((prev) => prev.filter((item) => item.id !== p.id))} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <SearchOverlay
        open={searchOpen}
        query={searchQuery}
        suggestions={searchSuggestions}
        onChange={setSearchQuery}
        onClose={() => setSearchOpen(false)}
        onSubmit={submitSearch}
        onPick={performSearch}
      />

      {/* Mobile App Bottom Tab Bar (Flipkart/Myntra style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200/50 dark:border-neutral-900 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-lg py-2.5 px-3 flex items-center justify-around lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)] select-none">
        <BottomTabLink href="/" label="Home" icon={Home} active={pathname === "/"} />
        <BottomTabLink href="/products" label="Explore" icon={Search} active={pathname.startsWith("/products")} />
        <BottomTabLink href="/wishlist" label="Wishlist" icon={Heart} active={pathname.startsWith("/wishlist")} />
        <BottomTabLink href="/cart" label="Cart" icon={ShoppingBag} active={pathname.startsWith("/cart")} badge={cartCount} />
        <BottomTabLink href="/account" label="Profile" icon={User} active={pathname.startsWith("/account")} />
      </div>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-4 py-2 transition hover:bg-electrox-elevated hover:text-foreground">
      {children}
    </Link>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="hidden h-10 w-10 place-items-center rounded-full text-neutral-450 transition hover:bg-electrox-elevated hover:text-foreground sm:grid">
      {children}
    </Link>
  );
}

function SearchOverlay({
  open,
  query,
  suggestions,
  onChange,
  onClose,
  onSubmit,
  onPick
}: {
  open: boolean;
  query: string;
  suggestions: SearchSuggestion[];
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onPick: (value: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[180] bg-black/60 dark:bg-black/80 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="mx-auto max-w-4xl pt-12 sm:pt-20">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.34em] text-electrox-blue">
                <Sparkles size={15} /> Instant Search
              </p>
              <button onClick={onClose} aria-label="Close search" className="grid h-10 w-10 place-items-center rounded-full border border-electrox-elevated bg-electrox-surface text-neutral-450 hover:bg-electrox-elevated hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="mt-5 flex min-h-16 items-center rounded-3xl border border-electrox-blue/30 bg-electrox-surface px-5 shadow-lg">
              <Search size={22} className="text-electrox-blue" />
              <input
                autoFocus
                value={query}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search wireless audio, smart watches, cameras..."
                className="ml-3 min-w-0 flex-1 bg-transparent text-lg font-bold text-foreground outline-none placeholder:text-neutral-450"
              />
            </form>
            <div className="mt-5 grid gap-3">
              {(suggestions.length ? suggestions : [
                { id: "trending-1", title: "Wireless Neckband", brand: "Trending" },
                { id: "trending-2", title: "Smart Watch", brand: "Popular" },
                { id: "trending-3", title: "Gaming Accessories", brand: "Explore" }
              ]).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => onPick(suggestion.title)}
                  className="flex items-center justify-between rounded-2xl border border-electrox-elevated bg-electrox-surface px-4 py-3 text-left transition hover:border-electrox-blue/60 hover:bg-electrox-blue/5"
                >
                  <span>
                    <span className="block font-black text-foreground">{suggestion.title}</span>
                    <span className="mt-1 block text-xs text-neutral-450">{[suggestion.brand, suggestion.category].filter(Boolean).join(" / ") || "Suggested product"}</span>
                  </span>
                  <ChevronRight size={16} className="text-neutral-450" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlyingParticle({ particle, onComplete }: { particle: Particle; onComplete: () => void }) {
  const distance = 34 + particle.speed * 9;
  const targetX = Math.cos(particle.angle) * distance;
  const targetY = Math.sin(particle.angle) * distance;

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: targetX, y: targetY, scale: 0.1, opacity: 0 }}
      transition={{ duration: 0.64, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      style={{
        position: "absolute",
        width: 5,
        height: 5,
        borderRadius: "50%",
        backgroundColor: particle.color,
        boxShadow: `0 0 10px ${particle.color}`
      }}
    />
  );
}

function BottomTabLink({
  href,
  label,
  icon: Icon,
  active,
  badge
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-1 min-w-[54px] text-center">
      <div className="relative">
        <Icon size={19} className={active ? "text-indigo-650 dark:text-indigo-400" : "text-neutral-400 dark:text-neutral-500"} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 rounded-full bg-rose-500 px-1 py-0.2 text-[8px] font-black text-white min-w-[14px] text-center scale-90">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[8px] font-extrabold uppercase tracking-widest ${active ? "text-indigo-650 dark:text-indigo-400" : "text-neutral-400 dark:text-neutral-500"}`}>
        {label}
      </span>
    </Link>
  );
}
