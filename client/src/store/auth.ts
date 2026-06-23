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
      if (user) {
        if (typeof window !== "undefined") {
          document.cookie = "grim_auth_status=true; path=/; max-age=172800; SameSite=Lax";
        }
        set({
          user,
          status: "authenticated"
        });
      } else {
        if (typeof window !== "undefined") {
          document.cookie = "grim_auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ user: null, status: "unauthenticated" });
      }
    } catch {
      if (typeof window !== "undefined") {
        document.cookie = "grim_auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      set({ user: null, status: "unauthenticated" });
      throw new Error("Unauthenticated");
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        document.cookie = "grim_auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      set({ user: null, status: "unauthenticated" });
    }
  }
}));
