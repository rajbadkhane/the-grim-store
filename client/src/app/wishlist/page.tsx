"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";

type Product = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  images?: string[];
  salePrice: number;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/users/wishlist-products");
        if (cancelled) return;

        // response uses `products` key
        setProducts((res.data?.products ?? []) as Product[]);
      } catch {
        if (cancelled) return;
        setProducts([]);
        toast.error("Failed to load wishlist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">My Wishlist</h1>

      {loading && <p className="mt-6 text-sm font-bold text-white/60">Loading...</p>}

      {!loading && products.length === 0 && (
        <div className="mt-8 rounded-md border border-white/10 bg-white/[0.035] p-8">
          <p className="text-sm font-bold text-white/60">No wishlist items yet.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
