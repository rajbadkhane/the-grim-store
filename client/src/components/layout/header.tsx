"use client";

import Link from "next/link";
import { Box, Heart, Home, Menu, Moon, Search, ShoppingBag, Sun, User, X, Skull, ArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useFlyCartStore } from "@/store/fly-cart";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/store/auth";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://the-grim-store.onrender.com/api/v1";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCategories, setLiveCategories] = useState<HeaderCategory[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [visualOffset, setVisualOffset] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const cartRef = useRef<HTMLAnchorElement>(null);
  const setCartIconRect = useFlyCartStore((state) => state.setCartIconRect);

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
    function updateVisualOffset() {
      const viewport = window.visualViewport;
      setVisualOffset(Math.max(0, Math.round(window.innerHeight - (viewport?.height ?? window.innerHeight))));
    }
    updateVisualOffset();
    window.visualViewport?.addEventListener("resize", updateVisualOffset);
    window.visualViewport?.addEventListener("scroll", updateVisualOffset);
    window.addEventListener("resize", updateVisualOffset);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateVisualOffset);
      window.visualViewport?.removeEventListener("scroll", updateVisualOffset);
      window.removeEventListener("resize", updateVisualOffset);
    };
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

  const navLinks = [
    { label: "New Arrivals", href: "/products?sort=latest" },
    { label: "Phones", href: "/products?q=phone" },
    { label: "Audio", href: "/products?q=audio" },
    { label: "Gaming", href: "/products?q=gaming" },
    { label: "Wearables", href: "/products?q=watch" },
    { label: "Sale", href: "/products?sort=popular" }
  ];

  const isCheckoutPage = pathname.startsWith("/checkout");
  const isCartPage = pathname.startsWith("/cart");

  if (isCheckoutPage) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/40 dark:border-neutral-800/40 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md transition-all">
        {/* Screen-wide announcements bar */}
        <div className="w-full bg-[#111827] text-white text-[11px] font-medium tracking-wide">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5">
            <span className="font-heading">PLAY • LEARN • EXPLORE | Use Code <strong className="text-[#FFD93D] font-bold">GRIM40</strong></span>
            <Link href="/account?tab=orders" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold hover:bg-white/20 transition duration-150">
              <Box size={12} /> Track Order
            </Link>
          </div>
        </div>

        {/* Screen-wide navigation and search header */}
        <div className="mx-auto flex h-16 lg:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-250 dark:border-neutral-800 bg-white dark:bg-neutral-900 lg:hidden shadow-xs active:scale-95 transition-transform" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex min-w-fit items-center gap-2 px-1 hover:opacity-90 active:scale-98 transition-transform">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25">
              <Skull size={16} className="text-white fill-current" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-heading font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none">THE GRIM STORE</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[#FF6B35]">Modern Families</span>
            </div>
          </Link>

          {/* Nav links with bento megamenu triggers */}
          <nav className="hidden items-center gap-2 text-sm font-semibold lg:flex self-stretch">
            {navLinks.map((link) => (
              <div key={link.href} className="relative flex h-full items-center group/nav">
                <Link
                  href={link.href}
                  className="flex h-10 items-center text-neutral-700 hover:text-[#FF6B35] dark:text-neutral-300 dark:hover:text-[#FF6B35] transition-colors duration-150 text-xs font-bold uppercase tracking-wider px-3.5 rounded-lg hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40"
                >
                  {link.label}
                </Link>

                {/* Mega Menu Dropdown */}
                {link.label !== "Sale" && link.label !== "New Arrivals" && (
                  <div className="absolute top-[85%] left-1/2 -translate-x-1/2 mt-1.5 w-[520px] bg-white dark:bg-[#151B26] border border-neutral-200/50 dark:border-neutral-800/80 shadow-xl rounded-2xl p-6 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-[160] grid grid-cols-2 gap-6 text-left">
                    <div className="bg-[#FAFAFA] dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200/30 dark:border-neutral-800/30">
                      <h4 className="text-xs font-heading font-extrabold text-[#FF6B35] uppercase tracking-wider mb-3">Top Catalog categories</h4>
                      <div className="flex flex-col gap-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-350">
                        <Link href={`/products?q=${link.label.toLowerCase()}&sort=popular`} className="hover:text-[#FF6B35] flex items-center justify-between group/sub">
                          Trending {link.label} <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all" />
                        </Link>
                        <Link href={`/products?q=${link.label.toLowerCase()}&sort=latest`} className="hover:text-[#FF6B35] flex items-center justify-between group/sub">
                          New Releases <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all" />
                        </Link>
                        <Link href={`/products?q=${link.label.toLowerCase()}&max=5000`} className="hover:text-[#FF6B35] flex items-center justify-between group/sub">
                          Budget Picks (Under ₹5,000) <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all" />
                        </Link>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-heading font-extrabold text-neutral-850 dark:text-white uppercase tracking-wider mb-3">Featured Brands</h4>
                      <div className="flex flex-col gap-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-350">
                        <Link href="/products?brand=Sony" className="hover:text-[#FF6B35]">Sony Products</Link>
                        <Link href="/products?brand=Apple" className="hover:text-[#FF6B35]">Apple Devices</Link>
                        <Link href="/products?brand=Samsung" className="hover:text-[#FF6B35]">Samsung Gear</Link>
                        <Link href="/products?brand=OnePlus" className="hover:text-[#FF6B35]">OnePlus Gadgets</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search bar inside header */}
          <div className="relative hidden lg:block flex-grow max-w-xs xl:max-w-sm">
            <div 
              onClick={() => setSearchOpen(true)}
              className="flex items-center bg-neutral-100 hover:bg-neutral-200/60 dark:bg-neutral-900/60 dark:hover:bg-neutral-900 rounded-full px-4 py-2.5 text-[11px] cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all"
            >
              <Search size={14} className="text-neutral-400 shrink-0 mr-2.5" />
              <span className="text-neutral-450 dark:text-neutral-400 font-medium">Search for smart toys, gaming consoles...</span>
              <kbd className="ml-auto hidden xl:inline-flex items-center gap-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-1.5 font-mono text-[9px] font-bold text-neutral-400">
                /
              </kbd>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger for Mobile/Tablet */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 active:scale-95 transition-transform"
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 hover:text-[#FF6B35] dark:text-neutral-300 dark:hover:text-[#FF6B35] active:scale-95 transition-transform"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Profile Action with hover dropdown */}
            <div className="relative flex group/profile self-stretch items-center">
              <Link
                href="/account"
                className="flex items-center justify-center p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 hover:text-[#FF6B35] dark:text-neutral-300 dark:hover:text-[#FF6B35] active:scale-95 transition-transform cursor-pointer"
                aria-label="Profile"
              >
                <User size={17} />
              </Link>

              {/* Profile Dropdown Menu (Desktop only) */}
              <div className="absolute top-[80%] right-0 mt-1.5 w-64 bg-white dark:bg-[#151B26] border border-neutral-200/50 dark:border-neutral-800/80 shadow-xl rounded-2xl py-4 px-5 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 z-[160] text-left hidden lg:block">
                {user ? (
                  <div className="border-b border-neutral-200/40 dark:border-neutral-800/60 pb-3.5 mb-3.5">
                    <h3 className="text-xs font-heading font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Hello {user.name || "Customer"}</h3>
                    <p className="text-[11px] text-neutral-450 dark:text-neutral-450 mt-1 truncate">{user.email}</p>
                  </div>
                ) : (
                  <div className="border-b border-neutral-200/40 dark:border-neutral-800/60 pb-3.5 mb-3.5">
                    <h3 className="text-xs font-heading font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Welcome</h3>
                    <p className="text-[11px] text-neutral-450 mt-1">Manage orders, tracking, and wishlist</p>
                    <Link href="/login" className="mt-3.5 inline-flex items-center justify-center w-full min-h-10 rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition">
                      Login / Signup
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-3 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <Link href="/account?tab=orders" className="hover:text-[#FF6B35] transition">My Orders</Link>
                  <Link href="/wishlist" className="hover:text-[#FF6B35] transition">Wishlist</Link>
                  <Link href="/account?tab=addresses" className="hover:text-[#FF6B35] transition">Saved Addresses</Link>
                  <Link href="/account?tab=profile" className="hover:text-[#FF6B35] transition">Profile Info</Link>
                  {user && (
                    <button
                      onClick={async () => {
                        await logout();
                        window.location.href = "/";
                      }}
                      className="border-t border-neutral-200/40 dark:border-neutral-800/60 pt-3 text-left text-xs font-extrabold text-red-500 hover:text-red-600 transition cursor-pointer w-full"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist Action */}
            <Link
              href="/wishlist"
              className="flex items-center justify-center p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 hover:text-[#FF6B35] dark:text-neutral-300 dark:hover:text-[#FF6B35] active:scale-95 transition-transform"
              aria-label="Wishlist"
            >
              <Heart size={17} />
            </Link>

            {/* Cart/Bag Action */}
            <Link
              ref={cartRef}
              href="/cart"
              className="flex items-center justify-center p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 hover:text-[#FF6B35] dark:text-neutral-300 dark:hover:text-[#FF6B35] active:scale-95 transition-transform relative"
              aria-label="Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 min-w-[17px] h-4 rounded-full bg-[#FF6B35] text-[8.5px] font-bold text-white flex items-center justify-center px-1 border-2 border-white dark:border-[#0B0F19]">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[170] bg-black/40 backdrop-blur-xs lg:hidden" onClick={() => setMenuOpen(false)}>
            <motion.aside 
              initial={{ translateX: "-100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="flex flex-col h-full w-[80vw] max-w-xs bg-white dark:bg-[#0B0F19] p-5 shadow-2xl border-r border-neutral-200/50 dark:border-neutral-800" 
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/50 dark:border-neutral-800">
                <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FF6B35] text-white">
                    <Skull size={14} className="text-white fill-current" />
                  </span>
                  <span className="text-sm font-heading font-extrabold uppercase tracking-wide text-neutral-900 dark:text-white">Grim Store</span>
                </Link>
                <button onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              
              <div className="mt-4 flex-1 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">Shop Categories</p>
                <div className="flex flex-col">
                  {[...navLinks, ...liveCategories.slice(0, 6).map((category) => ({ label: category.name, href: `/products?category=${category.slug}` }))].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3.5 px-1 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250 border-b border-neutral-100/70 dark:border-neutral-900/30 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sidebar Footer with Theme Toggle */}
              <div className="mt-auto pt-4 border-t border-neutral-200/50 dark:border-neutral-800">
                <button
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-250 hover:bg-neutral-100 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <span>Theme: {theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  {theme === "dark" ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay 
            open={searchOpen} 
            query={searchQuery} 
            suggestions={searchSuggestions} 
            onChange={setSearchQuery} 
            onClose={() => setSearchOpen(false)} 
            onSubmit={submitSearch} 
            onPick={performSearch} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom navigation */}
      {!isCheckoutPage && (
        <div 
          className="fixed left-0 right-0 bottom-0 z-[1000] border-t border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#0B0F19]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] lg:hidden"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="mx-auto flex max-w-md items-center justify-between">
            <BottomTabLink href="/" label="Home" icon={Home} active={pathname === "/"} />
            <BottomTabLink href="/products" label="Explore" icon={Box} active={pathname === "/products"} />
            <BottomTabLink 
              href="#" 
              label="Search" 
              icon={Search} 
              active={searchOpen} 
              onClick={(e) => {
                e.preventDefault();
                setSearchOpen(true);
              }} 
            />
            <BottomTabLink href="/wishlist" label="Wishlist" icon={Heart} active={pathname.startsWith("/wishlist")} />
            <BottomTabLink href="/cart" label="Cart" icon={ShoppingBag} active={pathname.startsWith("/cart")} badge={cartCount} />
          </div>
        </div>
      )}
    </>
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
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (value: string) => void;
  onPick: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Escape key closes search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fallback: SearchSuggestion[] = [
    { id: "toys", title: "Kids Smart Toys", brand: "Bestseller" },
    { id: "gaming", title: "Gaming Consoles", brand: "Trending" },
    { id: "audio", title: "Premium Audio Gear", brand: "New Arrival" },
    { id: "wearables", title: "Smart Wearables", brand: "Popular" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[180] bg-neutral-900/60 dark:bg-black/70 backdrop-blur-md p-4 flex items-start justify-center overflow-y-auto"
    >
      <motion.div 
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        ref={containerRef}
        className="mt-12 md:mt-20 w-full max-w-2xl bg-white dark:bg-[#151B26] rounded-3xl border border-neutral-200/60 dark:border-neutral-800/80 p-5 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <form onSubmit={onSubmit} className="flex min-h-12 flex-1 items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 focus-within:ring-2 focus-within:ring-[#FF6B35]/40 focus-within:border-[#FF6B35] transition-all">
            <Search size={18} className="text-[#FF6B35] shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Search toys, consoles, audio, wearables..."
              className="ml-3 min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold outline-none text-neutral-850 dark:text-neutral-100 placeholder-neutral-400"
            />
          </form>
          <button onClick={onClose} aria-label="Close search" className="grid h-12 w-12 place-items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors active:scale-95">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <h4 className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#FF6B35] mb-3 px-1">
            {query.trim().length >= 2 ? "Search Results" : "Trending Searches"}
          </h4>
          
          <div className="grid gap-2">
            {(suggestions.length ? suggestions : fallback).map((suggestion) => (
              <button 
                key={suggestion.id} 
                onClick={() => onPick(suggestion.title)} 
                className="flex items-center justify-between rounded-xl border border-neutral-200/50 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-[#FF6B35]/40 transition-all cursor-pointer group"
              >
                <span>
                  <span className="block text-xs font-bold text-neutral-900 dark:text-neutral-200 group-hover:text-[#FF6B35] transition-colors">{suggestion.title}</span>
                  <span className="block text-[9px] font-semibold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
                    {[suggestion.brand, suggestion.category].filter(Boolean).join(" • ") || "Popular Category"}
                  </span>
                </span>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-[#FF6B35] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BottomTabLink({ 
  href, 
  label, 
  icon: Icon, 
  active, 
  badge,
  onClick
}: { 
  href: string; 
  label: string; 
  icon: any; 
  active: boolean; 
  badge?: number;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const content = (
    <>
      <div className="relative flex h-6 w-6 items-center justify-center">
        <Icon size={19} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-2.5 -top-1.5 min-w-[15px] h-3.5 rounded-full bg-[#FF6B35] text-[8px] font-bold text-white flex items-center justify-center px-1 border border-white dark:border-[#0B0F19]">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{label}</span>
    </>
  );

  const className = `relative flex min-w-14 flex-col items-center justify-center gap-1.5 py-1 text-center transition-colors ${
    active ? "text-[#FF6B35]" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
  }`;

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
