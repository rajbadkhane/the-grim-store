"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Heart } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { LightweightCanvas } from "@/components/layout/lightweight-canvas";

type Product = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  images?: string[];
  salePrice: number;
  price: number;
  brand?: string;
  variants?: any[];
};

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshMe, openLoginModal } = useAuth();
  const addCart = useCart((state) => state.add);

  async function loadWishlist() {
    setLoading(true);
    try {
      const res = await api.get("/users/wishlist-products");
      setProducts((res.data?.products ?? []) as Product[]);
    } catch (err: any) {
      setProducts([]);
      if (err?.response?.status !== 401) {
        toast.error("Failed to load wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function handleRemove(productId: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await api.post(`/users/wishlist/${productId}`);
      await refreshMe();
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(productId)));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item.");
    }
  }

  async function handleMoveToBag(product: Product, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Quick Add first variant or product details
    const selectedVariant = product.variants?.[0] || null;
    const image = selectedVariant?.images?.[0] || product.image || product.images?.[0] || "";
    
    addCart({
      id: selectedVariant?.sku ? `${product.id}:${selectedVariant.sku}` : product.id,
      slug: product.slug,
      title: product.title,
      image,
      salePrice: Number(product.salePrice),
      quantity: 1,
      sku: selectedVariant?.sku,
      variantKey: selectedVariant?.sku,
      color: selectedVariant?.color,
      size: selectedVariant?.size
    });

    toast.success("Moved to Bag");

    // Remove from wishlist
    try {
      await api.post(`/users/wishlist/${product.id}`);
      await refreshMe();
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(product.id)));
    } catch {
      // Slient fail for wishlist remove, let grid reload
    }
  }

  return (
    <main className="mobile-bottom-safe min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100">
            My Wishlist{" "}
            <span className="text-sm font-normal text-neutral-450 dark:text-neutral-500 lowercase tracking-normal">
              ({products.length} {products.length === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>

        {loading && (
          <div className="grid h-[240px] place-items-center">
            <p className="text-sm font-bold text-neutral-450 animate-pulse">Loading wishlist...</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-250 dark:border-neutral-800/80 rounded-2xl bg-neutral-50/40 dark:bg-neutral-900/20 px-6 max-w-xl mx-auto mt-8">
            <LightweightCanvas />
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 text-[var(--accent)] mb-6 animate-pulse">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            <h2 className="relative z-10 text-lg font-black text-neutral-850 dark:text-neutral-200 uppercase tracking-wider">Your Wishlist is Empty</h2>
            <p className="relative z-10 mt-3 text-xs text-neutral-450 dark:text-neutral-500 font-semibold max-w-sm leading-relaxed">
              Explore our premium tech catalog, save your favorite items here, and track price drops or discount deals!
            </p>
            <Link
              href="/products"
              className="relative z-10 mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] hover:bg-[#e05626] px-8 text-xs font-black uppercase tracking-wider text-white transition-all shadow-md shadow-[var(--accent)]/20 hover:scale-[1.02] cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const hasDiscount = product.price > product.salePrice;
              const discountPercentage = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
              const cardImage = product.image || product.images?.[0] || "";

              return (
                <article
                  key={product.id}
                  className="group relative flex flex-col bg-white dark:bg-[#171a1d] border border-[#282c3f]/10 dark:border-white/5 p-3 rounded-2xl overflow-hidden product-card-hover z-10 hover:z-20"
                >
                  {/* Remove cross button */}
                  <button
                    onClick={(event) => handleRemove(product.id, event)}
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 dark:bg-neutral-850/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-850 transition-colors shadow-md z-20"
                    title="Remove from Wishlist"
                  >
                    <X size={13} />
                  </button>

                  <Link href={`/products/${product.slug}`} className="relative block aspect-[3/4] w-full bg-neutral-100/50 dark:bg-[#1a1c1e]/50 overflow-hidden rounded-xl border border-[#282c3f]/5 dark:border-transparent">
                    {cardImage ? (
                      <Image
                        src={cardImage}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-xs font-bold uppercase text-neutral-450">No Image</div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-3 text-left">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-200 truncate">
                      {product.brand || "The Grim Store"}
                    </p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-0.5 line-clamp-1 text-[11px] text-neutral-500 dark:text-neutral-450 font-normal hover:text-[var(--accent)] transition-colors"
                    >
                      {product.title}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-[12px] font-bold text-neutral-900 dark:text-white">{formatMoney(Number(product.salePrice))}</span>
                      {hasDiscount && (
                        <>
                          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-550 line-through">{formatMoney(Number(product.price))}</span>
                          <span className="text-[10px] font-bold text-rose-500">({discountPercentage}% OFF)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Move to Bag button */}
                  <button
                    onClick={(event) => handleMoveToBag(product, event)}
                    className="mt-3 w-full h-10 flex items-center justify-center gap-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white rounded-lg transition-colors text-xs font-extrabold uppercase"
                  >
                    <ShoppingBag size={12} />
                    Move to Bag
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
