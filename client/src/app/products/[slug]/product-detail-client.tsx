"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Heart, Minus, PackageCheck, Plus, RotateCcw, Ruler, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, Zap, ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { StoreProduct, StoreProductVariant } from "@/lib/catalog-api";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { GeoProductSection } from "@/components/geo-product-section";
import { motion, AnimatePresence } from "framer-motion";

type Option = { label: string; enabled: boolean; hex?: string };

function unique<T>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function fallbackVariant(product: StoreProduct): StoreProductVariant {
  return {
    color: product.colors?.[0]?.name ?? "Black",
    colorHex: product.colors?.[0]?.hex ?? "#111111",
    size: product.sizes?.[0]?.label ?? "M",
    material: "Premium cotton",
    pattern: "Solid",
    sku: product.slug.toUpperCase(),
    stock: product.stock,
    price: product.price,
    salePrice: product.salePrice,
    images: product.images,
    available: product.stock > 0
  };
}

export function ProductDetailClient({ product }: { product: StoreProduct }) {
  const variants = useMemo(() => (product.variants.length ? product.variants : [fallbackVariant(product)]), [product]);
  const firstAvailable = variants.find((variant) => variant.available && variant.stock > 0) ?? variants[0];
  const [color, setColor] = useState(firstAvailable.color);
  const [size, setSize] = useState(firstAvailable.size);
  const [material, setMaterial] = useState(firstAvailable.material ?? "");
  const [pattern, setPattern] = useState(firstAvailable.pattern ?? "");
  const [quantity, setQuantity] = useState(1);
  const [visualOffset, setVisualOffset] = useState(0);
  const [pincode, setPincode] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function checkPincodeDelivery() {
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      setEstimatedDelivery(null);
      setPincodeChecked(false);
      return;
    }
    const days = 2 + (Number(pincode) % 4);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
    const dateStr = deliveryDate.toLocaleDateString("en-US", options);
    setEstimatedDelivery(dateStr);
    setPincodeChecked(true);
    toast.success(`Serviceable! Delivery estimated by ${dateStr}`);
  }

  const add = useCart((state) => state.add);
  const router = useRouter();
  const { user, refreshMe, openLoginModal } = useAuth();
  const isWishlisted = Array.isArray(user?.wishlist) && user.wishlist.map(String).includes(String(product.id));

  async function toggleWishlist() {
    if (!user) {
      toast.error("Login required to use wishlist.");
      openLoginModal();
      return;
    }

    try {
      await api.post(`/users/wishlist/${product.id}`);
      await refreshMe();
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Wishlist update failed. Try again.");
    }
  }

  const selectedVariant =
    variants.find((variant) => variant.color === color && variant.size === size && (variant.material ?? "") === material && (variant.pattern ?? "") === pattern) ??
    variants.find((variant) => variant.color === color && variant.size === size) ??
    firstAvailable;

  const gallery = selectedVariant.images.length ? selectedVariant.images : product.images.length ? product.images : product.image ? [product.image] : [""];
  const [activeImage, setActiveImage] = useState(gallery[0] ?? "");
  const visibleImage = gallery.includes(activeImage) ? activeImage : gallery[0] ?? "";
  const discount = selectedVariant.price > selectedVariant.salePrice ? Math.round(((selectedVariant.price - selectedVariant.salePrice) / selectedVariant.price) * 100) : 0;
  const canBuy = selectedVariant.available && selectedVariant.stock > 0;

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

  const colorOptions = optionSet(variants, "color", selectedVariant, ["size", "material", "pattern"]);
  const sizeOptions = optionSet(variants, "size", selectedVariant, ["color", "material", "pattern"]);
  const materialOptions = optionSet(variants, "material", selectedVariant, ["color", "size", "pattern"]);
  const patternOptions = optionSet(variants, "pattern", selectedVariant, ["color", "size", "material"]);

  function pickColor(nextColor: string) {
    const next = variants.find((variant) => variant.color === nextColor && variant.available && variant.stock > 0) ?? variants.find((variant) => variant.color === nextColor);
    if (!next) return;
    setColor(next.color);
    setSize(next.size);
    setMaterial(next.material ?? "");
    setPattern(next.pattern ?? "");
    setQuantity(1);
    if (next.images[0]) setActiveImage(next.images[0]);
  }

  function pickDimension(key: "size" | "material" | "pattern", value: string) {
    const next =
      variants.find((variant) => variant.color === color && (variant as any)[key] === value && variant.available && variant.stock > 0) ??
      variants.find((variant) => variant.color === color && (variant as any)[key] === value);
    if (!next) return;
    setSize(next.size);
    setMaterial(next.material ?? "");
    setPattern(next.pattern ?? "");
    setQuantity(1);
    if (next.images[0]) setActiveImage(next.images[0]);
  }

  function validateSelection() {
    if (!canBuy) {
      toast.error("This variant is currently out of stock.");
      return false;
    }
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} pieces available for this variant.`);
      return false;
    }
    return true;
  }

  function addSelectedToCart() {
    if (!validateSelection()) return false;
    add({
      id: `${product.id}:${selectedVariant.sku}`,
      slug: product.slug,
      title: product.title,
      image: gallery[0] ?? product.image,
      brand: product.brand,
      price: selectedVariant.price,
      salePrice: selectedVariant.salePrice,
      quantity,
      sku: selectedVariant.sku,
      variantKey: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.color,
      material: selectedVariant.material,
      pattern: selectedVariant.pattern
    });
    toast.success("Variant added to cart");
    return true;
  }

  function buyNow() {
    if (!canBuy) {
      toast.error("This variant is currently out of stock.");
      return;
    }
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} pieces available for this variant.`);
      return;
    }
    sessionStorage.setItem(
      "grim_checkout_intent",
      JSON.stringify({
        isDirect: true,
        item: {
          id: `${product.id}:${selectedVariant.sku}`,
          slug: product.slug,
          title: product.title,
          image: gallery[0] ?? product.image,
          brand: product.brand,
          price: selectedVariant.price,
          salePrice: selectedVariant.salePrice,
          quantity,
          sku: selectedVariant.sku,
          variantKey: selectedVariant.sku,
          size: selectedVariant.size,
          color: selectedVariant.color,
          material: selectedVariant.material,
          pattern: selectedVariant.pattern
        },
        createdAt: new Date().toISOString()
      })
    );
    router.push(`/checkout?product=${encodeURIComponent(product.slug)}`);
  }

  return (
    <div className="text-foreground bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
          Home / Products / <span className="text-[var(--accent)]">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <section className="min-w-0">
            {/* Mobile View Slider */}
            <div className="md:hidden">
              <Swiper spaceBetween={12} slidesPerView={1.06} onSlideChange={(swiper) => setActiveImage(gallery[swiper.activeIndex] ?? visibleImage)}>
                {gallery.map((image, index) => (
                  <SwiperSlide key={`${image}-${index}`}>
                    <GalleryFrame image={image} title={product.title} priority={index === 0} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop View with Left Thumbnails & Right Active Image */}
            <div className="hidden md:flex gap-4 items-start">
              {/* Vertical Thumbnail List */}
              {gallery.length > 1 && (
                <div className="flex flex-col gap-2.5 w-20 shrink-0 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
                  {gallery.slice(0, 6).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(image)}
                      onMouseEnter={() => setActiveImage(image)}
                      className={`relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-white dark:bg-neutral-900 transition-all ${
                        visibleImage === image
                          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain p-1.5"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Active Main Image Frame */}
              <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm transition-shadow hover:shadow-md">
                {visibleImage ? (
                  <Image
                    src={visibleImage}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1280px) 50vw, 600px"
                    className="object-contain p-6 transition-transform duration-500 hover:scale-[1.01]"
                    priority
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs font-black uppercase text-neutral-450">No image</div>
                )}
              </div>
            </div>

            <div className="mt-5 hidden md:grid grid-cols-3 gap-1.5 sm:gap-3">
              <InfoPill icon={<Truck size={18} />} title="Fast dispatch" text="Ships in 24-48 hours" />
              <InfoPill icon={<RotateCcw size={18} />} title="Easy returns" text="7-day size exchange" />
              <InfoPill icon={<ShieldCheck size={18} />} title="Secure checkout" text="Protected payments" />
            </div>
          </section>

          {/* Sticky Info Panel */}
          <aside className="md:sticky md:top-24 md:h-fit self-start">
            <div className="rounded border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-[#111315] p-5 sm:p-6 shadow-sm">
              <div className="border-b border-neutral-200/40 dark:border-neutral-800/40 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--accent)] dark:text-[var(--accent)]">{product.brand || "The Grim Store"}</p>
                    <h1 className="mt-1.5 text-xl font-black leading-tight text-neutral-900 dark:text-white uppercase tracking-tight">{product.title}</h1>
                  </div>

                  {/* Circular Rotating Gold Seal Badge */}
                  <div className="flex items-center gap-2 shrink-0 select-none">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#1a253c] border-2 border-[#d4af37] shadow-md">
                      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite]">
                        <path id="circlePath-gold" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                        <text className="fill-[#d4af37] text-[7px] font-black uppercase tracking-[0.03em]">
                          <textPath href="#circlePath-gold">
                            • GRIM ASSURED • 100% AUTHENTIC •
                          </textPath>
                        </text>
                      </svg>
                      <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a253c] border border-[#d4af37]">
                        <span className="text-[#d4af37] text-xs font-black">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price row (Moved here) */}
                <div className="mt-5 border-t border-b border-neutral-100 dark:border-neutral-900 py-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {formatMoney(selectedVariant.salePrice)}
                    </span>
                    {selectedVariant.price > selectedVariant.salePrice && (
                      <>
                        <span className="text-sm text-neutral-400 dark:text-neutral-500 line-through">{formatMoney(selectedVariant.price)}</span>
                        <span className="text-sm font-bold text-[var(--accent)]">({discount}% OFF)</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Inclusive of all taxes</p>
                </div>

                {/* Rating badge (Myntra Style) */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-white/50 dark:bg-black/25">
                    <span className="flex items-center gap-0.5">{product.rating.toFixed(1)} <Star size={12} fill="currentColor" className="text-red-500" /></span>
                    <span className="text-neutral-350 dark:text-neutral-700 font-normal">|</span>
                    <span>{product.reviewCount} Ratings</span>
                  </span>
                  <span className={`rounded px-2.5 py-1 text-xs font-bold uppercase ${canBuy ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-white/55"}`}>
                    {canBuy ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Mobile Features block */}
              <div className="mt-5 block md:hidden space-y-4">
                <div className="grid grid-cols-3 gap-1.5">
                  <InfoPill icon={<Truck size={14} />} title="Fast dispatch" text="Ships in 24h" />
                  <InfoPill icon={<RotateCcw size={14} />} title="Easy returns" text="7-day size" />
                  <InfoPill icon={<ShieldCheck size={14} />} title="Secure pay" text="Razorpay" />
                </div>
                <ProductSummary product={product} />
              </div>

              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-450">SKU {selectedVariant.sku}</p>
              <p className="mt-5 text-sm leading-6 text-neutral-400 font-medium">{product.shortDescription || product.description}</p>

              {/* Swatch options selection */}
              <div className="mt-6 grid gap-5">
                <VariantGroup title="Color" options={colorOptions} selected={color} onPick={pickColor} swatches />
                <VariantGroup title="Size" options={sizeOptions} selected={size} onPick={(value) => pickDimension("size", value)} />
                {materialOptions.length > 1 && <VariantGroup title="Material" options={materialOptions} selected={material} onPick={(value) => pickDimension("material", value)} />}
                {patternOptions.length > 1 && <VariantGroup title="Pattern" options={patternOptions} selected={pattern} onPick={(value) => pickDimension("pattern", value)} />}
              </div>

              {/* Quantity selector */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-11 items-center rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <button aria-label="Decrease quantity" type="button" className="grid h-11 w-10 place-items-center text-neutral-450 hover:text-foreground" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-black">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    type="button"
                    className="grid h-11 w-10 place-items-center text-neutral-450 hover:text-foreground"
                    onClick={() => setQuantity((value) => Math.min(selectedVariant.stock || 1, value + 1))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions Buy Now / Add to Cart (Solid Navy & Orange CTAs) */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addSelectedToCart}
                  disabled={!canBuy}
                  className="flex-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#1a253c] hover:bg-[#2c3d5c] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={14} /> Add to Bag
                </button>
                <button
                  type="button"
                  onClick={buyNow}
                  disabled={!canBuy}
                  className="flex-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap size={14} className="fill-current" /> Buy Now
                </button>
              </div>

              {/* Delivery Pincode Checker (Myntra style) */}
              <div className="mt-6 border-t border-neutral-200/40 dark:border-neutral-800/40 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-450 mb-2.5">Delivery Options</p>
                <div className="flex max-w-sm rounded-sm border border-white/50 dark:border-white/5 bg-white/40 dark:bg-[#111315]/40 backdrop-blur-md px-3.5 py-2 items-center focus-within:border-[var(--accent)] dark:focus-within:border-[var(--accent)] focus-within:shadow-[0_0_12px_rgba(255,63,108,0.15)] focus-within:ring-1 focus-within:ring-[var(--accent)]/20 transition-all shadow-xs">
                  <Truck size={14} className="text-neutral-400 dark:text-neutral-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit Pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-transparent text-xs font-bold text-foreground outline-none placeholder:text-neutral-450"
                  />
                  <button
                    type="button"
                    onClick={checkPincodeDelivery}
                    className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:text-[#e6355e] transition-colors px-2"
                  >
                    Check
                  </button>
                </div>
                {pincodeChecked && estimatedDelivery && (
                  <div className="mt-3 rounded-sm bg-red-500/5 border border-red-500/10 p-3 text-xs space-y-1.5 backdrop-blur-xs">
                    <p className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <Truck size={14} /> Get it by {estimatedDelivery}
                    </p>
                    <p className="text-neutral-450 dark:text-neutral-400 font-medium">• Cash on Delivery (COD) available</p>
                    <p className="text-neutral-450 dark:text-neutral-400 font-medium">• Hassle-free 7-day returns & exchanges</p>
                  </div>
                )}
                {!pincodeChecked && (
                  <p className="mt-2 text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold">Please enter PIN code to check delivery time & COD availability.</p>
                )}
              </div>

              <div className="hidden md:block">
                <ProductSummary product={product} />
              </div>
            </div>
          </aside>
        </div>

        <ProductSpecificationsAccordion product={product} />
        <GeoProductSection product={product} />
      </div>

      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-[#0b0f19]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden flex gap-3 items-center"
          >
            <div className="flex-1 flex gap-2.5 items-center min-w-0">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                <Image src={gallery[0] ?? product.image} alt={product.title} fill className="object-contain p-1" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold truncate text-neutral-850 dark:text-neutral-200">{product.title}</h4>
                <p className="text-xs font-black text-[var(--accent)]">{formatMoney(selectedVariant.salePrice)}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={addSelectedToCart}
                disabled={!canBuy}
                className="flex h-10 items-center justify-center rounded-lg bg-[#1a253c] text-white px-3 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-40"
              >
                Add
              </button>
              <button
                onClick={buyNow}
                disabled={!canBuy}
                className="flex h-10 items-center justify-center rounded-lg bg-[#f97316] text-white px-4 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-40"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function optionSet(variants: StoreProductVariant[], key: keyof StoreProductVariant, selected: StoreProductVariant, keep: Array<keyof StoreProductVariant>): Option[] {
  return unique(variants.map((variant) => String(variant[key] ?? ""))).map((label) => {
    const match = variants.find((variant) => {
      if (String(variant[key] ?? "") !== label) return false;
      return keep.every((field) => String(variant[field] ?? "") === String(selected[field] ?? ""));
    });
    const fallback = variants.find((variant) => String(variant[key] ?? "") === label);
    const candidate = match ?? fallback;
    return {
      label,
      enabled: Boolean(candidate?.available && (candidate?.stock ?? 0) > 0),
      hex: fallback?.colorHex
    };
  });
}

function GalleryFrame({ image, title, priority }: { image: string; title: string; priority?: boolean }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded border border-neutral-100 dark:border-neutral-850 bg-neutral-50 dark:bg-[#121212] shadow-sm">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 95vw, (max-width: 1280px) 58vw, 680px"
          className="object-contain p-6 transition duration-500 group-hover:scale-102 sm:p-8"
        />
      ) : (
        <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-neutral-450">No image</div>
      )}
    </div>
  );
}

function VariantGroup({ title, options, selected, onPick, swatches }: { title: string; options: Option[]; selected: string; onPick: (value: string) => void; swatches?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-450">{title}</p>
        {title === "Size" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider cursor-pointer hover:underline">
            <Ruler size={11} /> Size chart
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={!option.enabled}
            onClick={() => onPick(option.label)}
            className={`relative inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border px-4 text-xs font-bold transition-all duration-200 ${
              selected === option.label
                ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] shadow-[0_0_12px_rgba(255,63,108,0.15)] ring-1 ring-[var(--accent)]/20"
                : "border-white/50 dark:border-white/5 bg-white/60 dark:bg-neutral-900/60 text-foreground hover:border-[var(--accent)] dark:hover:border-[var(--accent)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            } disabled:cursor-not-allowed disabled:opacity-35`}
          >
            {swatches && <span className="h-3.5 w-3.5 rounded-full border border-neutral-300 dark:border-white/20 shadow-xs" style={{ backgroundColor: option.hex ?? option.label }} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoPill({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315] p-2 sm:p-3 shadow-xs">
      <span className="text-[var(--accent)] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate leading-tight">{title}</p>
        <p className="mt-0.5 text-[8px] sm:text-[10px] font-semibold text-neutral-450 truncate leading-none">{text}</p>
      </div>
    </div>
  );
}

function ProductSummary({ product }: { product: StoreProduct }) {
  const items = product.summary.length
    ? product.summary
    : [
        { title: "Build", text: "Selected for daily handling, repeat use, and practical utility." },
        { title: "Standard", text: "Checked for finish, fit, packaging, and dispatch readiness." },
        { title: "Care", text: "Covered by direct store support." }
      ];

  return (
    <section className="mt-7 rounded border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#1a1c1e]/30 p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <Sparkles size={16} className="text-[var(--accent)]" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Product Summary</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <div key={`${item.text}-${index}`} className="flex gap-3">
            <PackageCheck size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <p className="text-xs leading-5 text-neutral-450 font-semibold">
              {item.title && <strong className="text-foreground">{item.title}: </strong>}
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductSpecificationsAccordion({ product }: { product: StoreProduct }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    specifications: false,
    delivery: false,
    returns: false,
  });

  const toggleAccordion = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const genericAdminHtml =
    "<h2>Product Details</h2><p>Practical electronic item with dependable construction, everyday utility, and clear product variants.</p><ul><li>Useful daily function</li><li>Checked before dispatch</li><li>Easy everyday handling</li></ul>";
  const hasCustomRichDescription = product.descriptionHtml && product.descriptionHtml !== "<p></p>" && product.descriptionHtml !== genericAdminHtml;
  const descriptionHtml = textToHtml(product.description);

  return (
    <div className="mt-10 border-t border-neutral-200 dark:border-neutral-850 pt-8">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)] mb-6">Product Details & Specifications</p>
      
      <div className="space-y-3">
        {/* Description Accordion */}
        <div className="border border-white/50 dark:border-white/5 bg-white/40 dark:bg-[#111315]/40 backdrop-blur-md rounded-sm overflow-hidden transition-all duration-300 hover:border-white/80 dark:hover:border-white/10">
          <button
            onClick={() => toggleAccordion("description")}
            className="flex w-full items-center justify-between bg-white/60 dark:bg-neutral-900/20 px-4 py-3.5 text-left font-bold text-xs uppercase tracking-wider text-neutral-850 dark:text-neutral-200 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-all"
          >
            <span>Product Description</span>
            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${openSections.description ? "rotate-180 text-[var(--accent)]" : ""}`} />
          </button>
          {openSections.description && (
            <div className="p-4 bg-white/50 dark:bg-transparent border-t border-neutral-100/40 dark:border-neutral-850/40 text-xs leading-6 text-neutral-400 font-medium">
              <div className="rich-product-html" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              {hasCustomRichDescription && (
                <div className="rich-product-html mt-6 border-t border-neutral-100/40 dark:border-neutral-850/40 pt-4" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
              )}
            </div>
          )}
        </div>

        {/* Specifications Accordion */}
        <div className="border border-white/50 dark:border-white/5 bg-white/40 dark:bg-[#111315]/40 backdrop-blur-md rounded-sm overflow-hidden transition-all duration-300 hover:border-white/80 dark:hover:border-white/10">
          <button
            onClick={() => toggleAccordion("specifications")}
            className="flex w-full items-center justify-between bg-white/60 dark:bg-neutral-900/20 px-4 py-3.5 text-left font-bold text-xs uppercase tracking-wider text-neutral-850 dark:text-neutral-200 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-all"
          >
            <span>Specifications & Details</span>
            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${openSections.specifications ? "rotate-180 text-[var(--accent)]" : ""}`} />
          </button>
          {openSections.specifications && (
            <div className="p-4 bg-white/50 dark:bg-transparent border-t border-neutral-100/40 dark:border-neutral-850/40 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2">
                  <span className="w-1/3 text-neutral-450 font-semibold">Brand</span>
                  <span className="w-2/3 text-neutral-800 dark:text-neutral-200 font-bold">{product.brand || "Grim Store"}</span>
                </div>
                <div className="flex border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2">
                  <span className="w-1/3 text-neutral-450 font-semibold">Category</span>
                  <span className="w-2/3 text-neutral-800 dark:text-neutral-200 font-bold uppercase">{product.category || "General"}</span>
                </div>
                {product.variants?.[0]?.material && (
                  <div className="flex border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2">
                    <span className="w-1/3 text-neutral-450 font-semibold">Material</span>
                    <span className="w-2/3 text-neutral-800 dark:text-neutral-200 font-bold">{product.variants[0].material}</span>
                  </div>
                )}
                {product.variants?.[0]?.pattern && (
                  <div className="flex border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2">
                    <span className="w-1/3 text-neutral-450 font-semibold">Pattern</span>
                    <span className="w-2/3 text-neutral-800 dark:text-neutral-200 font-bold">{product.variants[0].pattern}</span>
                  </div>
                )}
                <div className="flex border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2">
                  <span className="w-1/3 text-neutral-450 font-semibold">SKU Code</span>
                  <span className="w-2/3 text-neutral-800 dark:text-neutral-200 font-mono font-bold select-all">{product.variants?.[0]?.sku || product.slug.toUpperCase()}</span>
                </div>
                <div className="flex border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2">
                  <span className="w-1/3 text-neutral-450 font-semibold">Rating</span>
                  <span className="w-2/3 text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1">
                    {product.rating.toFixed(1)} <Star size={12} fill="currentColor" className="text-amber-500" /> ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {product.careInstructions.length > 0 && (
                <div className="mt-4 pt-2 border-t border-neutral-100/50 dark:border-neutral-850/40">
                  <p className="text-neutral-450 font-bold mb-2">Care Instructions:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-neutral-400">
                    {product.careInstructions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delivery Accordion */}
        <div className="border border-white/50 dark:border-white/5 bg-white/40 dark:bg-[#111315]/40 backdrop-blur-md rounded-sm overflow-hidden transition-all duration-300 hover:border-white/80 dark:hover:border-white/10">
          <button
            onClick={() => toggleAccordion("delivery")}
            className="flex w-full items-center justify-between bg-white/60 dark:bg-neutral-900/20 px-4 py-3.5 text-left font-bold text-xs uppercase tracking-wider text-neutral-850 dark:text-neutral-200 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-all"
          >
            <span>Delivery & Shipping Info</span>
            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${openSections.delivery ? "rotate-180 text-[var(--accent)]" : ""}`} />
          </button>
          {openSections.delivery && (
            <div className="p-4 bg-white/50 dark:bg-transparent border-t border-neutral-100/40 dark:border-neutral-850/40 text-xs leading-6 text-neutral-400 font-medium">
              <p>{String(product.deliveryInfo?.text ?? "Free delivery above INR 1499. Standard shipping takes 3-6 business days. Express shipping options are available at checkout.")}</p>
            </div>
          )}
        </div>

        {/* Returns Accordion */}
        <div className="border border-white/50 dark:border-white/5 bg-white/40 dark:bg-[#111315]/40 backdrop-blur-md rounded-sm overflow-hidden transition-all duration-300 hover:border-white/80 dark:hover:border-white/10">
          <button
            onClick={() => toggleAccordion("returns")}
            className="flex w-full items-center justify-between bg-white/60 dark:bg-neutral-900/20 px-4 py-3.5 text-left font-bold text-xs uppercase tracking-wider text-neutral-850 dark:text-neutral-200 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-all"
          >
            <span>Returns & Exchanges</span>
            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${openSections.returns ? "rotate-180 text-[var(--accent)]" : ""}`} />
          </button>
          {openSections.returns && (
            <div className="p-4 bg-white/50 dark:bg-transparent border-t border-neutral-100/40 dark:border-neutral-850/40 text-xs leading-6 text-neutral-400 font-medium">
              <p>{product.returnPolicy || "Easy 7-day size exchange or store credit returns on all unused and unwashed items with tags intact."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function textToHtml(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();

  if (!escaped) return "<h2>Product Details</h2><p>Practical construction with comfortable daily utility.</p>";

  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      if (lines.length > 1) {
        const [first, ...rest] = lines;
        return `<h3>${first}</h3><ul>${rest.map((line) => `<li>${line}</li>`).join("")}</ul>`;
      }
      return `<p>${block}</p>`;
    })
    .join("");
}
