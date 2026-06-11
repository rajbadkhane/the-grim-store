"use client";

import { ShoppingBag, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export function ProductActions({ product }: { product: any }) {
  const add = useCart((state) => state.add);
  const router = useRouter();

  const addProduct = () => {
    add({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image || product.images?.[0],
      salePrice: product.salePrice,
      quantity: 1,
      size: "M",
      color: "Black"
    });
    toast.success("Added to cart");
  };

  async function requireAuthThenBuy() {
    try {
      const res = await api.get("/auth/me");
      if (!res.data?.user) throw new Error("not authed");
    } catch {
      toast.error("Login required to buy now.");
      router.push("/account");
      return;
    }

    addProduct();
    router.push(`/checkout?product=${encodeURIComponent(product.slug)}`);
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 gap-2">
        {["S", "M", "L", "XL"].map((size) => (
          <button key={size} className="focus-ring rounded-2xl border border-white/12 bg-white/[0.035] py-3 font-bold text-white transition hover:border-blue-300/60 hover:bg-blue-500/10">
            {size}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button onClick={addProduct}>
          <ShoppingBag size={18} /> Add to cart
        </Button>

        <Button variant="outline" onClick={requireAuthThenBuy}>
          <Zap size={18} /> Buy now
        </Button>
      </div>
    </div>
  );
}
