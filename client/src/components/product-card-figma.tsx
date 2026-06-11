"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Star, ShoppingCart, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { useFlyCartStore } from "@/store/fly-cart";

export function ProductCardFigma({ product }: { product: any }) {
  const add = useCart((state) => state.add);
  const { user, refreshMe, openLoginModal } = useAuth();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const addFlight = useFlyCartStore((state) => state.addFlight);

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant =
    variants.find((entry: any) => entry.color === selectedColor && entry.available !== false && Number(entry.stock ?? 0) > 0) ??
    variants.find((entry: any) => entry.available !== false && Number(entry.stock ?? 0) > 0) ??
    null;
  const image = selectedVariant?.images?.[0] || product.image || product.images?.[0];
  const salePrice = Number(selectedVariant?.salePrice ?? product.salePrice ?? 0);
  const price = Number(selectedVariant?.price ?? product.price ?? salePrice);
  const rating = Number(product.rating ?? product.ratings?.average ?? 0);
  const reviewCount = Number(product.reviewCount ?? product.ratings?.count ?? 0);

  const isWishlisted = Array.isArray(user?.wishlist) && user.wishlist.map(String).includes(String(product.id));

  async function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    let startX = e.clientX;
    let startY = e.clientY;

    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    addFlight({
      id: `flight-${Date.now()}-${Math.random()}`,
      image: image || "",
      startX,
      startY,
      onComplete: () => {
        add({
          id: selectedVariant?.sku ? `${product.id}:${selectedVariant.sku}` : product.id,
          slug: product.slug,
          title: product.title,
          image: image || "",
          salePrice,
          quantity: 1,
          sku: selectedVariant?.sku,
          variantKey: selectedVariant?.sku,
          size: selectedVariant?.size,
          color: selectedVariant?.color ?? selectedColor,
          material: selectedVariant?.material,
          pattern: selectedVariant?.pattern
        });
        
        setIsLoading(false);
        toast.success(`${product.title} added to cart!`);
      }
    });
  };

  const hasDiscount = price > salePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const sizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)));

  return (
    <motion.article
      data-reveal
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-2 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.42)]"
    >
      <div 
        ref={imageContainerRef}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-50 dark:bg-[#121212] transition-colors duration-300"
      >
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3.5 transition-transform duration-500 group-hover:scale-104"
            draggable={false}
          />
        ) : (
          <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-600">No Image</div>
        )}

        {/* Brand Badges / Discount */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
              -{discountPercentage}%
            </span>
          )}
          {product.bestseller && (
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist and Quick View Buttons */}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 z-20">
          <button
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlistToggle}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200/50 dark:border-neutral-800/50 bg-white/95 dark:bg-neutral-900/90 text-neutral-800 dark:text-white shadow-sm transition hover:scale-110"
          >
            <Heart size={13} className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-neutral-500 dark:text-neutral-400"} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200/50 dark:border-neutral-800/50 bg-white/95 dark:bg-neutral-900/90 text-neutral-800 dark:text-white shadow-sm transition hover:scale-110 opacity-0 group-hover:opacity-100 duration-200"
            title="Quick view"
          >
            <Eye size={13} className="text-neutral-500 dark:text-neutral-400" />
          </Link>
        </div>

        {/* Ratings pill (Myntra Style) */}
        {rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-white/90 dark:bg-neutral-900/90 px-1.5 py-0.5 text-[9px] font-bold text-neutral-800 dark:text-neutral-200 shadow-sm z-10 border border-neutral-200/10">
            <span>{rating.toFixed(1)}</span>
            <Star size={9} fill="currentColor" className="text-amber-500" />
            {reviewCount > 0 && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <span>{reviewCount}</span>
              </>
            )}
          </div>
        )}

        {/* Hover Quick Add Button (Myntra/Flipkart Style) */}
        <button
          disabled={isLoading}
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 z-25 flex cursor-pointer items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 py-2.5 text-center text-[10px] font-black uppercase tracking-wider opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200"
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full animate-spin" />
          ) : (
            <ShoppingCart size={11} />
          )}
          {isLoading ? "Adding..." : "Add To Cart"}
        </button>
      </div>

      {/* Info Block */}
      <div className="pt-2 flex flex-col flex-grow">
        {/* Brand label & Assured Tag */}
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
            {product.brand || "The Grim Store"}
          </p>
          {/* Assured Star Badge */}
          <div className="inline-flex items-center gap-0.5 bg-blue-600 dark:bg-blue-800 px-1 py-0.2 rounded text-[7px] font-black uppercase text-white tracking-widest scale-90 shrink-0 shadow-sm select-none">
            Assured <span className="text-yellow-400">★</span>
          </div>
        </div>
        
        {/* Title / Variant Hover container */}
        <div className="relative mt-1 h-5 overflow-hidden">
          <div className="transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0">
            <Link href={`/products/${product.slug}`} className="block line-clamp-1 text-xs font-bold text-foreground transition duration-150 hover:text-indigo-600 dark:hover:text-indigo-400">
              {product.title}
            </Link>
          </div>
          <div className="absolute inset-0 flex items-center gap-1.5 opacity-0 translate-y-full transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-[8px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Specs:</span>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {sizes.length > 0 ? (
                sizes.map((sz: any) => (
                  <span key={sz} className="text-[8px] font-black px-1.5 py-0.2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-foreground scale-95 uppercase shrink-0">
                    {sz}
                  </span>
                ))
              ) : (
                <span className="text-[8px] font-black text-neutral-450 uppercase">Standard</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Price row */}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs font-extrabold text-foreground">{formatMoney(salePrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-[10px] font-semibold text-neutral-400 line-through">{formatMoney(price)}</span>
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-450">({discountPercentage}% OFF)</span>
            </>
          )}
        </div>

        {/* Swatches (optional color indicator) */}
        {Array.isArray(product.colors) && product.colors.length > 1 && (
          <div className="mt-2 flex items-center gap-1">
            {product.colors.slice(0, 4).map((col: any) => (
              <button
                key={col.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(col.name);
                }}
                className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 ${
                  selectedColor === col.name ? "scale-110 border-indigo-550 ring-1 ring-indigo-550/20" : "border-neutral-200 dark:border-white/10"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[8px] font-bold text-neutral-400">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
