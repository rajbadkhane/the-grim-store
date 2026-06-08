"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Star, ShoppingCart } from "lucide-react";
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
  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);

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

    // Get exact starting center coordinates of image container
    let startX = e.clientX;
    let startY = e.clientY;

    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    // Trigger quadratic Bezier arc flight animation
    addFlight({
      id: `flight-${Date.now()}-${Math.random()}`,
      image: image || "",
      startX,
      startY,
      onComplete: () => {
        // Appends product state to cart upon flight arrival impact
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

  return (
    <article className="group flex flex-col w-full transition-all duration-350 hover:-translate-y-1.5 hover:shadow-lg dark:hover:shadow-none bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 rounded-md p-3 pb-4 shadow-sm">
      {/* Image Container with Badges and Overlay Actions */}
      <div 
        ref={imageContainerRef}
        className="relative aspect-square w-full rounded-md border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-neutral-900/60 overflow-hidden flex items-center justify-center transition-colors duration-300"
      >
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="text-xs font-black uppercase text-neutral-400 dark:text-white/30">No Image</div>
        )}

        {/* Badges (Left) */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="rounded bg-red-500 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow">
              -{discountPercentage}%
            </span>
          )}
          {product.bestseller && (
            <span className="rounded bg-emerald-500 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow">
              NEW
            </span>
          )}
        </div>

        {/* Action Buttons (Right) */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlistToggle}
            className="rounded-full bg-black/60 p-2 text-white hover:bg-red-500/90 hover:scale-110 transition duration-200 backdrop-blur-sm"
          >
            <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-white"} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="rounded-full bg-black/60 p-2 text-white hover:bg-red-500/90 hover:scale-110 transition duration-200 backdrop-blur-sm flex items-center justify-center"
            title="Quick view"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Slide-Up Add To Cart Bar */}
        <motion.button
          disabled={isLoading}
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-0 left-0 right-0 bg-black/95 text-white text-center py-2.5 font-black text-[11px] uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition duration-300 ease-out hover:bg-red-650 disabled:bg-neutral-800 disabled:text-white/45 flex items-center justify-center gap-2 cursor-pointer z-20 shadow-lg hover:shadow-red-500/20"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ShoppingCart size={14} />
          )}
          {isLoading ? "Adding..." : "Add To Cart"}
        </motion.button>
      </div>

      {/* Product Information */}
      <div className="pt-3 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="font-bold text-sm text-neutral-800 dark:text-white/90 group-hover:text-red-550 group-hover:dark:text-red-400 line-clamp-1 transition duration-200">
          {product.title}
        </Link>
        
        {/* Prices */}
        <div className="mt-1 flex items-center gap-2">
          <span className="font-black text-red-500 text-sm">{formatMoney(salePrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 dark:text-white/35 line-through font-bold">{formatMoney(price)}</span>
          )}
        </div>

        {/* Ratings & Review Count */}
        <div className="mt-1 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(rating) ? "currentColor" : "none"}
                className={i < Math.round(rating) ? "text-amber-400" : "text-neutral-200 dark:text-white/20"}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-white/40">({reviewCount})</span>
        </div>

        {/* Colors Swatches (If present) */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {product.colors.map((col: any) => (
              <button
                key={col.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(col.name);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                  selectedColor === col.name ? "border-red-550 scale-125 ring-1 ring-red-500/30" : "border-neutral-300 dark:border-transparent"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
