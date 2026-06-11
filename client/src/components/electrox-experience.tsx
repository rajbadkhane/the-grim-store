"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export function ElectroXExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routeKey = useMemo(() => pathname, [pathname]);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.08,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6
          }
        });
      });
    });

    return () => ctx.revert();
  }, [routeKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 820);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {booting && (
          <motion.div
            className="fixed inset-0 z-[300] grid place-items-center bg-[#050816]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="relative min-w-[280px] text-center">
              <motion.div
                className="mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] border border-white/15 bg-white/[0.06] text-xl font-black text-white shadow-[0_0_80px_rgba(59,130,246,0.45)] backdrop-blur-2xl"
                initial={{ scale: 0.8, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              >
                GS
              </motion.div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.42em] text-slate-300">The Grim Store</p>
              <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#7C3AED] to-[#A855F7] shadow-[0_0_28px_rgba(168,85,247,0.8)]"
                  initial={{ width: "12%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
