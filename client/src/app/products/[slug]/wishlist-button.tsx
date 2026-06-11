"use client";

import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export function WishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { refreshMe, user } = useAuth();

  async function ensureAuth() {
    try {
      await refreshMe();
      if (!user) throw new Error("unauth");
      return true;
    } catch {
      toast.error("Login required to use wishlist.");
      router.push("/account");
      return false;
    }
  }

  async function toggleWishlist() {
    const ok = await ensureAuth();
    if (!ok) return;

    try {
      await api.post(`/users/wishlist/${productId}`);
      toast.success("Wishlist updated");
    } catch {
      toast.error("Wishlist update failed. Try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-blue-300"
    >
      <Heart size={18} /> Add to wishlist
    </button>
  );
}
