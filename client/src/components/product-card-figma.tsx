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
    <motion.article
      data-reveal
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="electrox-card group flex w-full flex-col rounded-3xl p-3 pb-4"
    >
      <div 
        ref={imageContainerRef}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1224] via-[#111827] to-[#050816] transition-colors duration-300"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(59,130,246,0.22),transparent_42%),radial-gradient(circle_at_20%_90%,rgba(168,85,247,0.18),transparent_36%)]" />
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
            draggable={false}
          />
        ) : (
          <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">No Image</div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="rounded-full border border-blue-300/30 bg-blue-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-100 shadow-[0_0_24px_rgba(59,130,246,0.22)] backdrop-blur-md">
              -{discountPercentage}%
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-full border border-purple-300/30 bg-purple-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-100 backdrop-blur-md">
              NEW
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlistToggle}
            className="rounded-full border border-white/10 bg-black/45 p-2 text-white backdrop-blur-md transition duration-200 hover:border-pink-300/50 hover:bg-pink-500/30 hover:shadow-[0_0_24px_rgba(236,72,153,0.28)]"
          >
            <Heart size={16} className={isWishlisted ? "fill-blue-500 text-blue-500" : "text-white"} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center rounded-full border border-white/10 bg-black/45 p-2 text-white backdrop-blur-md transition duration-200 hover:border-blue-300/50 hover:bg-blue-500/30 hover:shadow-[0_0_24px_rgba(59,130,246,0.28)]"
            title="Quick view"
          >
            <Eye size={16} />
          </Link>
        </div>

        <motion.button
          disabled={isLoading}
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-3 left-3 right-3 z-20 flex translate-y-16 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 py-3 text-center text-[11px] font-black uppercase tracking-widest text-white opacity-0 shadow-[0_0_34px_rgba(59,130,246,0.3)] transition duration-300 ease-out hover:shadow-[0_0_44px_rgba(168,85,247,0.38)] disabled:opacity-60 group-hover:translate-y-0 group-hover:opacity-100"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ShoppingCart size={14} />
          )}
          {isLoading ? "Adding..." : "Add To Cart"}
        </motion.button>
      </div>

      <div className="pt-3 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="line-clamp-1 text-sm font-black text-white transition duration-200 group-hover:text-blue-200">
          {product.title}
        </Link>
        
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-black text-blue-200">{formatMoney(salePrice)}</span>
          {hasDiscount && (
            <span className="text-xs font-bold text-slate-500 line-through">{formatMoney(price)}</span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <div className="flex items-center text-violet-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(rating) ? "currentColor" : "none"}
                className={i < Math.round(rating) ? "text-violet-300" : "text-white/15"}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-500">({reviewCount})</span>
        </div>

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
                  selectedColor === col.name ? "scale-125 border-blue-300 ring-2 ring-blue-500/30" : "border-white/20"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <Zap size={12} className="text-blue-300" /> Fast Dispatch
        </div>
      </div>
    </motion.article>
  );
}
