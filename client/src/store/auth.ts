"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

type AuthUser = {
  id: string;
  role: string;
  email?: string;
  name?: string;
  wishlist?: string[];
};

type AuthState = {
  user: AuthUser | null;
  status: "unknown" | "checking" | "authenticated" | "unauthenticated";
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: "unknown",
  showLoginModal: false,
  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),

  refreshMe: async () => {
    const state = get();
    if (state.status === "checking") return;

    set({ status: "checking" });
    try {
      const res = await api.get("/auth/me");
      const user = (res.data?.user ?? null) as AuthUser | null;
      set({
        user,
        status: user ? "authenticated" : "unauthenticated"
      });
    } catch {
      set({ user: null, status: "unauthenticated" });
      throw new Error("Unauthenticated");
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null, status: "unauthenticated" });
    }
  }
}));
