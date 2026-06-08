"use client";

import { create } from "zustand";

export type Flight = {
  id: string;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete?: () => void;
};

type FlyCartState = {
  flights: Flight[];
  cartIconRect: DOMRect | null;
  arrivalTriggered: number;
  setCartIconRect: (rect: DOMRect | null) => void;
  addFlight: (flight: Omit<Flight, "endX" | "endY">) => void;
  removeFlight: (id: string) => void;
  triggerArrival: () => void;
};

export const useFlyCartStore = create<FlyCartState>((set, get) => ({
  flights: [],
  cartIconRect: null,
  arrivalTriggered: 0,

  setCartIconRect: (rect) => set({ cartIconRect: rect }),

  addFlight: (flight) =>
    set((state) => {
      // Find where target is. If cartIconRect is not ready, default target is top right of viewport
      const targetX = state.cartIconRect
        ? state.cartIconRect.left + state.cartIconRect.width / 2
        : window.innerWidth - 60;
      const targetY = state.cartIconRect
        ? state.cartIconRect.top + state.cartIconRect.height / 2
        : 24;

      const newFlight: Flight = {
        ...flight,
        endX: targetX,
        endY: targetY
      };

      return { flights: [...state.flights, newFlight] };
    }),

  removeFlight: (id) =>
    set((state) => ({
      flights: state.flights.filter((f) => f.id !== id)
    })),

  triggerArrival: () =>
    set((state) => ({
      arrivalTriggered: state.arrivalTriggered + 1
    }))
}));
