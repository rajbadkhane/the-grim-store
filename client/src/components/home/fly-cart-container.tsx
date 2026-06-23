"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useFlyCartStore, Flight } from "@/store/fly-cart";

export function FlyCartContainer() {
  const flights = useFlyCartStore((state) => state.flights);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {flights.map((flight) => (
        <FlyingItem key={flight.id} flight={flight} />
      ))}
    </div>
  );
}

function FlyingItem({ flight }: { flight: Flight }) {
  const removeFlight = useFlyCartStore((state) => state.removeFlight);
  const triggerArrival = useFlyCartStore((state) => state.triggerArrival);

  // Framer Motion value for progress [0, 1]
  const progress = useMotionValue(0);

  // Quadratic Bezier curve calculation:
  // B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
  const x = useTransform(progress, (t) => {
    const p0 = flight.startX;
    const p2 = flight.endX;
    // P1 control point: horizontal midpoint
    const p1 = (p0 + p2) / 2;
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  });

  const y = useTransform(progress, (t) => {
    const p0 = flight.startY;
    const p2 = flight.endY;
    // P1 control point: elevated curve (highest point - 180px)
    const p1 = Math.min(p0, p2) - 180;
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  });

  // Shrink from 1 to 0.18, rotate slightly, and fade opacity near the end
  const scale = useTransform(progress, [0, 1], [1, 0.18]);
  const rotate = useTransform(progress, [0, 1], [0, 15]); // 15 degrees tilt
  const opacity = useTransform(progress, [0, 0.85, 1], [1, 0.8, 0.4]);

  useEffect(() => {
    // Animate progress smoothly at 60 FPS
    const controls = animate(progress, 1, {
      duration: 0.72, // 720ms - premium timing
      ease: [0.25, 1, 0.5, 1], // premium cubic-bezier ease
      onComplete: () => {
        // Run state completion updates (add to cart state)
        if (flight.onComplete) flight.onComplete();
        // Trigger cart icon bounces and sparkles
        triggerArrival();
        // Remove flight from active list
        removeFlight(flight.id);
      }
    });

    return () => controls.stop();
  }, [flight, progress, removeFlight, triggerArrival]);

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x,
        y,
        scale,
        rotate,
        opacity,
        width: 72,
        height: 72,
        transform: "translate(-50%, -50%)", // anchor to image center
        pointerEvents: "none"
      }}
      className="flex items-center justify-center overflow-hidden rounded-full border-2 border-[#FF3B30]/90 bg-neutral-900 shadow-2xl select-none"
    >
      {flight.image ? (
        <img
          src={flight.image}
          alt="Flying product"
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#FF3B30] text-[8px] font-black text-white">
          ADD
        </div>
      )}
    </motion.div>
  );
}
