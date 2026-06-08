"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Heart, Menu, Search, ShoppingBag, User, X, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/store/cart";
import { useTheme } from "../theme-provider";
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
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [liveCategories, setLiveCategories] = useState<HeaderCategory[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const { theme, toggleTheme } = useTheme();

  // Animation States
  const cartRef = useRef<HTMLDivElement>(null);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const setCartIconRect = useFlyCartStore((state) => state.setCartIconRect);
  const arrivalTriggered = useFlyCartStore((state) => state.arrivalTriggered);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/products/categories`, { credentials: "include", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setLiveCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        if (!cancelled) setLiveCategories([]);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
      controller.abort();
    };
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
        const response = await fetch(`${API_URL}/products/suggestions?q=${encodeURIComponent(query)}&limit=6`, {
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
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted, open]);

  // Update Cart Icon Rect for Flying Trajectory positioning
  useEffect(() => {
    if (!mounted) return;
    let frame = 0;
    function updateRect() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (cartRef.current) {
          setCartIconRect(cartRef.current.getBoundingClientRect());
        }
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
  }, [setCartIconRect, mounted]);

  // Handle Flight Arrival Impact Effects
  useEffect(() => {
    if (arrivalTriggered === 0) return;

    // Trigger bounce and glow pulse
    setIsBouncing(true);
    setShowGlow(true);

    // Spawn sparkles
    const newParticles: Particle[] = Array.from({ length: 14 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.35;
      const speed = 2.0 + Math.random() * 3.5;
      const colors = ["#ffb000", "#e11d2e", "#ffffff", "#10b981", "#3b82f6"];
      return {
        id: `${arrivalTriggered}-${i}-${Math.random()}`,
        x: 0,
        y: 0,
        angle,
        speed,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    });
    setParticles((prev) => [...prev, ...newParticles]);

    const bounceTimeout = setTimeout(() => setIsBouncing(false), 500);
    const glowTimeout = setTimeout(() => setShowGlow(false), 350);

    return () => {
      clearTimeout(bounceTimeout);
      clearTimeout(glowTimeout);
    };
  }, [arrivalTriggered]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
    }
  };

  const shopCategories = liveCategories.length ? liveCategories : [{ id: "all", name: "All Products", slug: "" }];
  const mobileNavItems = [
    { label: "New Drops", href: "/products?sort=latest" },
    ...liveCategories.slice(0, 4).map((category) => ({ label: category.name, href: `/products?category=${category.slug}` })),
    { label: "Cart", href: "/cart" },
    { label: "Account", href: "/account" }
  ];
  const navLinkClass =
    "relative bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 bg-clip-text transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-red-600 after:via-rose-500 after:to-amber-400 after:transition-all hover:text-transparent hover:after:w-full";

  return (
    <header className="glass sticky top-0 z-50 border-b border-neutral-200 dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-black tracking-wide text-neutral-950 dark:text-white">
          THE <span className="text-red-500">GRIM</span> STORE
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm font-semibold text-neutral-700 dark:text-white/78 lg:flex">
          <Link href="/products" className={navLinkClass}>New Drops</Link>
          <div className="group relative py-6">
            <button className={`${navLinkClass} font-semibold`}>Shop</button>
            <div className="invisible absolute left-1/2 top-16 grid w-[680px] -translate-x-1/2 grid-cols-3 gap-4 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0b0b0b] p-5 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              {shopCategories.map((item) => (
                <Link key={item.id} href={item.slug ? `/products?category=${item.slug}` : "/products"} className="group/item rounded-md border border-transparent bg-neutral-50 p-4 transition duration-200 hover:border-red-200 hover:bg-gradient-to-br hover:from-red-50 hover:to-amber-50 dark:bg-white/[0.03] dark:hover:border-red-500/30 dark:hover:bg-red-600/15">
                  <span className="block bg-gradient-to-r from-neutral-900 to-neutral-900 bg-clip-text font-bold text-neutral-900 transition group-hover/item:from-red-600 group-hover/item:to-amber-500 group-hover/item:text-transparent dark:from-white dark:to-white dark:text-white">{item.name}</span>
                  <span className="mt-1 block text-xs text-neutral-500 dark:text-white/55">Live inventory from your catalog</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/products?sort=popular" className={navLinkClass}>Bestsellers</Link>
          <Link href="/account" className={navLinkClass}>My Orders</Link>
        </nav>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden w-full max-w-sm items-center rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 lg:flex">
          <Search size={18} className="text-neutral-450 dark:text-white/45" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
            list="product-search-suggestions"
            placeholder="Search products..."
            className="ml-2 w-full bg-transparent text-sm text-neutral-800 dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-white/35"
          />
        </form>
        <datalist id="product-search-suggestions">
          {searchSuggestions.map((suggestion) => (
            <option key={suggestion.id} value={suggestion.title} label={[suggestion.brand, suggestion.category].filter(Boolean).join(" - ")} />
          ))}
        </datalist>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-md p-2 text-neutral-600 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 transition duration-200"
          >
            {!mounted ? <div className="w-5 h-5" /> : (theme === "light" ? <Moon size={20} /> : <Sun size={20} />)}
          </button>

          <IconLink href="/account" label="Account">
            <User size={20} />
          </IconLink>
          <IconLink href="/wishlist" label="Wishlist">
            <Heart size={20} />
          </IconLink>

          {/* Animated Cart Button */}
          <motion.div
            ref={cartRef}
            animate={{
              scale: isBouncing ? 1.25 : 1.0,
              y: isBouncing ? -4 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 10
            }}
            className="relative"
          >
            <Link 
              aria-label="Cart" 
              href="/cart" 
              className={`relative rounded-md p-2 text-neutral-600 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-all duration-300 ${
                showGlow ? "shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500 bg-red-500/10 scale-105" : ""
              }`}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, y: 3 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 10 }}
                  className="absolute -right-1 -top-1 rounded-full bg-red-650 px-1.5 py-0.5 text-[9px] font-black leading-none text-white shadow"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Sparkles particle burst */}
            <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
              {particles.map((p) => (
                <FlyingParticle
                  key={p.id}
                  particle={p}
                  onComplete={() => {
                    setParticles((prev) => prev.filter((item) => item.id !== p.id));
                  }}
                />
              ))}
            </div>
          </motion.div>

          <button aria-label="Open menu" className="rounded-md p-2 text-neutral-600 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-[2px] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu backdrop"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="relative z-[101] flex h-dvh w-[88vw] max-w-[380px] flex-col overflow-y-auto border-r border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white"
            >
              <div className="flex min-h-11 items-center justify-between gap-3">
                <Link href="/" onClick={() => setOpen(false)} className="text-base font-black tracking-wide text-neutral-950 dark:text-white">
                  THE <span className="text-red-500">GRIM</span> STORE
                </Link>
                <button aria-label="Close menu" className="rounded-md p-2 text-neutral-650 hover:bg-neutral-100 hover:text-red-500 dark:text-white/80 dark:hover:bg-white/10" onClick={() => setOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="mt-6 flex min-h-12 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 shadow-inner dark:border-white/10 dark:bg-white/5">
                <Search size={18} className="text-neutral-400 dark:text-white/45" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Mobile search"
                  list="product-search-suggestions"
                  placeholder="Search products"
                  className="ml-2 min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-white/35"
                />
              </form>

              <nav className="mt-6 grid gap-2.5">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-12 items-center justify-between rounded-md border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-850 shadow-sm transition hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/86 dark:hover:bg-red-650/15 dark:hover:text-red-300"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="text-neutral-350 transition group-hover:translate-x-0.5 group-hover:text-red-500 dark:text-white/30" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6">
                <Link
                  href="/products?sort=popular"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-md bg-gradient-to-r from-red-650 via-red-500 to-amber-500 px-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/15 transition hover:shadow-red-600/25"
                >
                  Shop Bestsellers
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="rounded-md p-2 text-neutral-600 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 transition duration-200">
      {children}
    </Link>
  );
}

function FlyingParticle({ particle, onComplete }: { particle: Particle; onComplete: () => void }) {
  const distance = 35 + particle.speed * 10;
  const targetX = Math.cos(particle.angle) * distance;
  const targetY = Math.sin(particle.angle) * distance;

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1.0, opacity: 1.0 }}
      animate={{
        x: targetX,
        y: targetY,
        scale: 0.1,
        opacity: 0
      }}
      transition={{
        duration: 0.64,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
      style={{
        position: "absolute",
        width: 5,
        height: 5,
        borderRadius: "50%",
        backgroundColor: particle.color,
        boxShadow: `0 0 6px ${particle.color}`,
        zIndex: 90
      }}
    />
  );
}
