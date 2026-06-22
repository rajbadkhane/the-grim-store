"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string;
  slug: string;
  title: string;
  image: string;
  brand?: string;
  price?: number;
  salePrice: number;
  quantity: number;
  sku?: string;
  variantKey?: string;
  size?: string;
  color?: string;
  material?: string;
  pattern?: string;
};

export function cartLineKey(item: Pick<CartItem, "id" | "sku" | "variantKey" | "size" | "color" | "material" | "pattern">) {
  return [item.id, item.sku ?? item.variantKey ?? "", item.size ?? "", item.color ?? "", item.material ?? "", item.pattern ?? ""].join("::");
}

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set(() => {
          const existing = get().items.find((entry) => entry.id === item.id && entry.size === item.size && entry.color === item.color);
          if (existing) {
            return {
              items: get().items.map((entry) => (entry === existing ? { ...entry, quantity: entry.quantity + item.quantity } : entry))
            };
          }
          return { items: [...get().items, item] };
        }),

      update: (id, quantity) =>
        set(() => ({
          items: get().items.map((item) => (cartLineKey(item) === id || item.id === id ? { ...item, quantity } : item))
        })),

      remove: (id) =>
        set(() => ({
          items: get().items.filter((item) => cartLineKey(item) !== id && item.id !== id)
        })),

      clear: () => set({ items: [] })
    }),
    {
      name: "grim_cart",
      partialize: (state) => ({ items: state.items })
    }
  )
);
