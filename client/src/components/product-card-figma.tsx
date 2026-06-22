"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";

export function ProductCardFigma({ product }: { product: any }) {
  const add = useCart((state) => state.add);
  const { user, refreshMe, openLoginModal } = useAuth();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant =
    variants.find((entry: any) => entry.color === selectedColor && entry.available !== false && Number(entry.stock ?? 0) > 0) ??
    variants.find((entry: any) => entry.available !== false && Number(entry.stock ?? 0) > 0) ??
    null;
  const image = selectedVariant?.images?.[0] || product.image || product.images?.[0];
  const salePrice = Number(selectedVariant?.salePrice ?? product.salePrice ?? 0);
  const price = Number(selectedVariant?.price ?? product.price ?? salePrice);
  const rating = Number(product.rating ?? product.ratings?.average ?? 4.8);
  const reviewCount = Number(product.reviewCount ?? product.ratings?.count ?? 128);
  const hasDiscount = price > salePrice;
  const discountPercentage = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0;
  const isWishlisted = Array.isArray(user?.wishlist) && user.wishlist.map(String).includes(String(product.id));

  // Determine on-brand badge
  let badgeText = "Trending";
  let badgeColor = "bg-[#FF6B35] text-white"; // default accent
  
  const titleLower = product.title.toLowerCase();
  const catLower = (product.category?.name || product.category || "").toString().toLowerCase();

  if (titleLower.includes("toy") || titleLower.includes("kid") || catLower.includes("toy") || catLower.includes("kid")) {
    badgeText = "Kids Favorite";
    badgeColor = "bg-[#FFD93D] text-[#111827]"; // highlight yellow
  } else if (rating >= 4.8 || titleLower.includes("console") || titleLower.includes("ps5") || titleLower.includes("xbox")) {
    badgeText = "Bestseller";
    badgeColor = "bg-[#111827] text-white dark:bg-white dark:text-[#111827]";
  } else if (product.flags?.isNew || titleLower.includes("new")) {
    badgeText = "New Arrival";
    badgeColor = "bg-[#22C55E] text-white";
  }

  async function handleWishlistToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
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

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    add({
      id: selectedVariant?.sku ? `${product.id}:${selectedVariant.sku}` : product.id,
      slug: product.slug,
      title: product.title,
      image: image || "",
      brand: product.brand,
      price,
      salePrice,
      quantity: 1,
      sku: selectedVariant?.sku,
      variantKey: selectedVariant?.sku,
      size: selectedVariant?.size,
      color: selectedVariant?.color ?? selectedColor,
      material: selectedVariant?.material,
      pattern: selectedVariant?.pattern
    });
    toast.success(`${product.title} added to cart`);
    window.setTimeout(() => setIsLoading(false), 180);
  }

  return (
    <motion.article 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col h-full bg-white dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/80 p-3 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-[#FF6B35]/30 dark:hover:border-[#FF6B35]/30 transition-all duration-300"
    >
      {/* Image container - Strict 1/1 Aspect Ratio occupying ~70% of vertical space */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAFAFA] dark:bg-neutral-900/60 border border-neutral-200/30 dark:border-transparent flex items-center justify-center">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.06]"
              draggable={false}
            />
          ) : (
            <div className="grid h-full place-items-center text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">No Image</div>
          )}
        </Link>

        {/* Hover backdrop gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.2 z-20">
          <span className={`rounded-md px-2 py-0.5 text-[8px] font-heading font-black uppercase tracking-wider shadow-xs select-none ${badgeColor}`}>
            {badgeText}
          </span>
          {hasDiscount && (
            <span className="rounded-md bg-[#FF6B35] px-2 py-0.5 text-[8px] font-heading font-black uppercase tracking-wider text-white shadow-xs select-none">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon overlay top-right */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-white/95 dark:bg-neutral-950/95 text-[#334155] dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 shadow-md z-20 backdrop-blur-xs transition hover:scale-110 active:scale-90 border border-neutral-200/20"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3 h-3 transition-all duration-300 ${
              isWishlisted ? "fill-red-500 text-red-500 scale-110" : "stroke-[2.5]"
            }`}
          />
        </button>
      </div>

      {/* Details container - Occupies remaining 30% of the card height */}
      <div className="relative flex flex-col justify-between flex-grow pt-3 bg-transparent z-20">
        <div>
          {/* Brand */}
          {product.brand && (
            <span className="text-[8px] font-heading font-black uppercase tracking-widest text-[#FF6B35]">
              {product.brand}
            </span>
          )}

          {/* Title - font-weight: 600, clamped to 2 lines max with height reservation */}
          <Link 
            href={`/products/${product.slug}`} 
            className="mt-0.5 line-clamp-2 text-xs font-semibold text-neutral-900 dark:text-white hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors leading-tight min-h-[2.25rem] block"
          >
            {product.title}
          </Link>

          {/* Rating Support */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex gap-0.5 text-[#FFD93D]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={`${
                    i < Math.round(rating)
                      ? "fill-[#FFD93D] text-[#FFD93D]"
                      : "text-neutral-200 dark:text-neutral-800"
                  }`}
                />
              ))}
            </div>
            <span className="text-[9.5px] text-slate-600 dark:text-slate-300 font-bold">
               ({rating.toFixed(1)})
             </span>
          </div>
        </div>

        {/* Footer Area: Price & Action */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-heading font-extrabold text-neutral-900 dark:text-white">
              {formatMoney(salePrice, true)}
            </span>
            {hasDiscount && (
              <span className="text-[9.5px] text-neutral-600 dark:text-neutral-400 line-through font-semibold">
                {formatMoney(price, true)}
              </span>
            )}
          </div>

          <button
            disabled={isLoading}
            onClick={handleAddToCart}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] dark:hover:text-white transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Add To Cart"
          >
            <ShoppingCart size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
