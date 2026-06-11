"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronRight, Heart, Menu, Search, ShoppingBag, User, X, Zap, Sparkles, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useFlyCartStore } from "@/store/fly-cart";

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
        animate={{ y: hidden ? -96 : 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 px-3 pt-3"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/12 bg-[#050816]/78 px-4 backdrop-blur-2xl transition-all duration-300 shadow-[0_22px_70px_rgba(0,0,0,0.24)] ${
            compact ? "h-14" : "h-18"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] text-sm font-black text-white shadow-[0_0_34px_rgba(59,130,246,0.32)]">
              <Cpu size={18} />
            </span>
            <span className="leading-none">
              <span className="block text-sm font-black uppercase tracking-[0.24em] text-white">The Grim</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400 group-hover:text-blue-300">Electronics</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-bold text-slate-300 lg:flex">
            <NavLink href="/products">Catalog</NavLink>
            <div className="group relative py-5">
              <button className="rounded-full px-4 py-2 transition hover:bg-white/[0.06] hover:text-white">Categories</button>
              <div className="invisible absolute left-1/2 top-16 grid w-[760px] -translate-x-1/2 grid-cols-3 gap-3 rounded-2xl border border-white/12 bg-[#081026]/95 p-4 opacity-0 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition group-hover:visible group-hover:opacity-100">
                {categories.slice(0, 9).map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.slug ? `/products?category=${item.slug}` : "/products"}
                    className="group/item rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-1 hover:border-blue-400/60 hover:bg-blue-500/10 hover:shadow-[0_0_36px_rgba(59,130,246,0.18)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-white">{item.name}</span>
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-blue-300">
                        {index + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">Live inventory, fast checkout, verified delivery flow.</p>
                  </Link>
                ))}
              </div>
            </div>
            <NavLink href="/products?sort=popular">Trending</NavLink>
            <NavLink href="/account?tab=orders">Orders</NavLink>
          </nav>

          <div className="hidden w-full max-w-sm items-center rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 lg:flex">
            <Search size={17} className="text-slate-400" />
            <button onClick={() => setSearchOpen(true)} className="ml-2 flex-1 text-left text-sm font-medium text-slate-400">
              Search phones, audio, cameras...
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button aria-label="Search products" onClick={() => setSearchOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white lg:hidden">
              <Search size={19} />
            </button>
            <IconLink href="/account" label="Account">
              <User size={19} />
            </IconLink>
            <IconLink href="/wishlist" label="Wishlist">
              <Heart size={19} />
            </IconLink>
            <motion.div ref={cartRef} className="relative" animate={{ scale: arrivalTriggered ? [1, 1.18, 1] : 1 }} transition={{ duration: 0.42 }}>
              <Link aria-label="Cart" href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-100 hover:border-blue-300/50 hover:shadow-[0_0_28px_rgba(59,130,246,0.32)]">
                <ShoppingBag size={19} />
                {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-1.5 py-0.5 text-[10px] font-black text-white">{cartCount}</span>}
              </Link>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                {particles.map((p) => (
                  <FlyingParticle key={p.id} particle={p} onComplete={() => setParticles((prev) => prev.filter((item) => item.id !== p.id))} />
                ))}
              </div>
            </motion.div>
            <button aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={21} />
            </button>
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

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[100] bg-[#020617]/80 backdrop-blur-md lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close menu backdrop" className="absolute inset-0 h-full w-full cursor-default" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="relative z-[101] flex h-dvh w-[88vw] max-w-[390px] flex-col overflow-y-auto border-r border-white/10 bg-[#050816] p-5 text-white shadow-2xl"
            >
              <div className="flex min-h-11 items-center justify-between gap-3">
                <Link href="/" onClick={() => setOpen(false)} className="text-base font-black uppercase tracking-[0.22em] text-white">
                  Grim Electronics
                </Link>
                <button aria-label="Close menu" className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <button onClick={() => setSearchOpen(true)} className="mt-6 flex min-h-12 items-center rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-slate-400">
                <Search size={18} />
                <span className="ml-2">Search products</span>
              </button>

              <nav className="mt-6 grid gap-2.5">
                {mobileLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-13 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-black text-slate-100 transition hover:border-blue-400/60 hover:bg-blue-500/10"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-blue-300" />
                  </Link>
                ))}
              </nav>

              <Link href="/products?sort=popular" onClick={() => setOpen(false)} className="mt-auto flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 px-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_0_38px_rgba(59,130,246,0.28)]">
                <Zap size={16} /> Shop Trending
              </Link>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-4 py-2 transition hover:bg-white/[0.06] hover:text-white">
      {children}
    </Link>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="hidden h-10 w-10 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white sm:grid">
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
        <motion.div className="fixed inset-0 z-[180] bg-[#020617]/88 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="mx-auto max-w-4xl pt-12 sm:pt-20">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.34em] text-blue-200">
                <Sparkles size={15} /> Instant Search
              </p>
              <button onClick={onClose} aria-label="Close search" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="mt-5 flex min-h-16 items-center rounded-3xl border border-blue-400/30 bg-white/[0.08] px-5 shadow-[0_0_80px_rgba(59,130,246,0.18)]">
              <Search size={22} className="text-blue-200" />
              <input
                autoFocus
                value={query}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search wireless audio, smart watches, cameras..."
                className="ml-3 min-w-0 flex-1 bg-transparent text-lg font-bold text-white outline-none placeholder:text-slate-500"
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
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left transition hover:border-blue-400/60 hover:bg-blue-500/10"
                >
                  <span>
                    <span className="block font-black text-white">{suggestion.title}</span>
                    <span className="mt-1 block text-xs text-slate-400">{[suggestion.brand, suggestion.category].filter(Boolean).join(" / ") || "Suggested product"}</span>
                  </span>
                  <ChevronRight size={16} className="text-slate-500" />
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
