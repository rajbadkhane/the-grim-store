"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function ProductCard({ product }: { product: any }) {
  const add = useCart((state) => state.add);
  const { user, refreshMe, openLoginModal } = useAuth();
  const router = useRouter();

  const variant = Array.isArray(product.variants) ? product.variants.find((entry: any) => entry.available !== false && Number(entry.stock ?? 0) > 0) : null;
  const image = variant?.images?.[0] || product.image || product.images?.[0];
  const salePrice = Number(variant?.salePrice ?? product.salePrice ?? 0);
  const price = Number(variant?.price ?? product.price ?? salePrice);
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

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-md border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,15,15,0.08)] transition hover:border-red-200 hover:shadow-[0_24px_70px_rgba(225,29,46,0.16)] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none dark:hover:border-red-500/40"
    >
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black">
        {image ? (
          <Image src={image} alt={product.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-3 transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs font-black uppercase tracking-widest text-neutral-400 dark:bg-neutral-900 dark:text-white/35">
            No image
          </div>
        )}
        {product.badge && <span className="absolute left-3 top-3 rounded bg-gradient-to-r from-red-650 to-red-500 px-2 py-1 text-xs font-black uppercase text-white shadow-lg shadow-red-600/20">{product.badge}</span>}
        <button
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-neutral-700 shadow-lg backdrop-blur transition hover:bg-red-600 hover:text-white dark:bg-black/65 dark:text-white"
        >
          <Heart size={17} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-1 text-xs font-bold text-amber-500">
          <Star size={14} fill="currentColor" /> {rating.toFixed(1)} <span className="text-neutral-400 dark:text-white/45">({reviewCount})</span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-10 font-black text-neutral-950 transition hover:bg-gradient-to-r hover:from-red-600 hover:to-amber-500 hover:bg-clip-text hover:text-transparent dark:text-white"
        >
          {product.title}
        </Link>
        {product.brand && <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-white/50">{product.brand}</p>}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-black text-neutral-950 dark:text-white">{formatMoney(salePrice)}</span>
          {price > salePrice && <span className="text-sm text-neutral-400 line-through dark:text-white/38">{formatMoney(price)}</span>}
        </div>
        <Button
          className="mt-4 w-full bg-gradient-to-r from-red-650 via-red-500 to-amber-500 shadow-lg shadow-red-600/15 hover:shadow-red-600/25"
          onClick={() => {
            add({
              id: variant?.sku ? `${product.id}:${variant.sku}` : product.id,
              slug: product.slug,
              title: product.title,
              image: image || "",
              salePrice,
              quantity: 1,
              sku: variant?.sku,
              variantKey: variant?.sku,
              size: variant?.size,
              color: variant?.color,
              material: variant?.material,
              pattern: variant?.pattern
            });
            toast.success("Added to cart");
          }}
        >
          <ShoppingBag size={17} /> Add
        </Button>
      </div>
    </motion.article>
  );
}
