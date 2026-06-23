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
  const rating = Number(product.rating ?? product.ratings?.average ?? 0);
  const hasDiscount = price > salePrice;
  const discountPercentage = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0;
  const isWishlisted = Array.isArray(user?.wishlist) && user.wishlist.map(String).includes(String(product.id));

  const titleLower = product.title.toLowerCase();
  const badgeText = product.flags?.isNew || titleLower.includes("new") ? "New Arrival" : rating >= 4.5 ? "Bestseller" : "Vault Pick";

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
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden border border-[#e5bdb8] bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF3B30] hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)] dark:border-[#3a1f1f] dark:bg-[#130b0b]"
    >
      {/* Image container - Strict 1/1 Aspect Ratio occupying ~70% of vertical space */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#eeeeee] dark:bg-[#120909] border border-[#e2e2e2] dark:border-[#352020] flex items-center justify-center">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.05]"
              draggable={false}
            />
          ) : (
            <div className="grid h-full place-items-center text-[10px] font-bold uppercase tracking-wider text-[#5c403c] dark:text-white/45">No Image</div>
          )}
        </Link>

        {/* Hover backdrop gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

        {/* Badges */}
        <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
          <span className="bg-[#FF3B30] px-1.5 py-0.5 text-[7px] font-heading font-black uppercase tracking-wider text-white shadow-xs select-none">
            {badgeText}
          </span>
          {hasDiscount && (
            <span className="bg-black px-1.5 py-0.5 text-[7px] font-heading font-black uppercase tracking-wider text-white shadow-xs select-none dark:bg-white dark:text-black">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon overlay top-right */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-2 top-2 z-20 border border-black/10 bg-white/95 p-1.5 text-[#1a1c1c] shadow-md backdrop-blur-xs transition hover:scale-105 hover:text-[#FF3B30] active:scale-90 dark:border-white/10 dark:bg-black/70 dark:text-white"
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
      <div className="relative flex flex-col justify-between flex-grow pt-2.5 bg-transparent z-20">
        <div>
          {/* Brand */}
          {product.brand && (
            <span className="text-[7px] font-heading font-black uppercase tracking-widest text-[#FF3B30]">
              {product.brand}
            </span>
          )}

          {/* Title - font-weight: 600, clamped to 2 lines max with height reservation */}
          <Link 
            href={`/products/${product.slug}`} 
            className="mt-0.5 block min-h-[2rem] line-clamp-2 text-[11px] font-black uppercase leading-tight text-[#1a1c1c] transition-colors hover:text-[#FF3B30] dark:text-white"
          >
            {product.title}
          </Link>

          {/* Rating Support */}
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="flex gap-0.5 text-[#FFD93D]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={9}
                  className={`${
                    i < Math.round(rating)
                      ? "fill-[#FFD93D] text-[#FFD93D]"
                      : "text-neutral-200 dark:text-neutral-800"
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] text-[#5c403c] dark:text-white/55 font-bold">
               ({rating.toFixed(1)})
             </span>
          </div>
        </div>

        {/* Footer Area: Price & Action */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[13px] font-heading font-extrabold text-[#1a1c1c] dark:text-white">
              {formatMoney(salePrice, true)}
            </span>
            {hasDiscount && (
              <span className="text-[9px] text-neutral-600 dark:text-neutral-400 line-through font-semibold">
                {formatMoney(price, true)}
              </span>
            )}
          </div>

          <button
            disabled={isLoading}
            onClick={handleAddToCart}
            className="flex h-6 w-6 items-center justify-center bg-[#1a1c1c] text-white shadow-xs transition-all duration-200 hover:scale-105 hover:bg-[#FF3B30] active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#FF3B30] dark:hover:text-white"
            title="Add To Cart"
          >
            <ShoppingCart size={11} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
