"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCanvasBackground from "./product-canvas-background";

type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
};

const getThemeClass = (slide: CarouselSlide) => {
  const text = `${slide.title} ${slide.subtitle} ${slide.description}`.toLowerCase();
  if (text.includes("audio") || text.includes("headphone") || text.includes("earbud") || text.includes("sound") || text.includes("speaker") || text.includes("acoustic")) {
    return {
      gradient: "from-[#1a0e30] via-[#0e071c] to-[#05020a]",
      glow: "bg-[#ff3f6c]/25",
    };
  }
  if (text.includes("game") || text.includes("gaming") || text.includes("play") || text.includes("controller") || text.includes("console") || text.includes("gamepad")) {
    return {
      gradient: "from-[#2b0c15] via-[#17060b] to-[#080204]",
      glow: "bg-[#a855f7]/30",
    };
  }
  if (text.includes("camera") || text.includes("eos") || text.includes("photo") || text.includes("lens") || text.includes("photography") || text.includes("shutter")) {
    return {
      gradient: "from-[#241c0c] via-[#120e06] to-[#060402]",
      glow: "bg-[#fbbf24]/22",
    };
  }
  if (text.includes("phone") || text.includes("mobile") || text.includes("smartphone") || text.includes("iphone") || text.includes("cellular")) {
    return {
      gradient: "from-[#082230] via-[#04121a] to-[#010609]",
      glow: "bg-[#06b6d4]/28",
    };
  }
  if (text.includes("laptop") || text.includes("computer") || text.includes("keyboard") || text.includes("pc") || text.includes("monitor") || text.includes("screen") || text.includes("display")) {
    return {
      gradient: "from-[#052917] via-[#02170d] to-[#010804]",
      glow: "bg-[#10b981]/22",
    };
  }
  return {
    gradient: "from-[#101316] via-[#080a0c] to-[#040506]",
    glow: "bg-[#ff3f6c]/25",
  };
};

export function HeroCarousel({ initialSlides }: { initialSlides: CarouselSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 22, y: -y * 22 }); // Max 22 degrees tilt
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % initialSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [initialSlides.length]);

  if (!initialSlides.length) return null;

  const themeStyles = getThemeClass(initialSlides[current]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${themeStyles.gradient} text-white min-h-[350px] sm:min-h-[420px] transition-all duration-1000`}>
      {/* Dynamic Product-Themed Canvas Background */}
      <ProductCanvasBackground activeSlide={initialSlides[current]} />

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent pointer-events-none z-10" />

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="grid min-h-[350px] items-center gap-6 p-8 sm:min-h-[420px] lg:grid-cols-[1.2fr_0.8fr] lg:p-12"
        >
          <div className="relative z-20">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#ff3f6c] text-white shadow-sm">
              {initialSlides[current].subtitle}
            </span>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl tracking-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.6)]">
              {initialSlides[current].title}
            </h1>
            <p className="mt-4 max-w-md text-sm font-semibold leading-relaxed text-neutral-300 [text-shadow:_0_1px_6px_rgba(0,0,0,0.5)]">
              {initialSlides[current].description}
            </p>
            <Link
              href={initialSlides[current].href}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded bg-[#ff3f6c] hover:bg-[#e6355e] px-8 text-xs font-black uppercase tracking-wider text-white transition-all duration-200 cursor-pointer shadow-lg shadow-[#ff3f6c]/20 hover:scale-[1.02]"
            >
              Shop Collection
            </Link>
          </div>
          <div className="relative min-h-[220px] sm:min-h-[280px] w-full flex items-center justify-center z-20">
            {/* Ambient Glow behind image */}
            <div className={`absolute w-64 h-64 ${themeStyles.glow} rounded-full blur-[80px] pointer-events-none transition-all duration-1000`} />
            {initialSlides[current].image && (
              <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1.5, -1.5, 0]
                }}
                transition={{
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transition: "transform 0.15s ease-out"
                }}
                className="relative w-full h-[220px] sm:h-[280px] cursor-grab active:cursor-grabbing"
              >
                <Image
                  src={initialSlides[current].image}
                  alt={initialSlides[current].title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-contain p-2 drop-shadow-[0_25px_55px_rgba(0,0,0,0.55)] select-none"
                  draggable={false}
                  style={{ transform: "translateZ(40px)" }} // Pop-out 3D parallax effect!
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrow Navigation */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + initialSlides.length) % initialSlides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/45 hover:bg-black/65 text-white/80 hover:text-white backdrop-blur-xs transition-all z-30 hover:scale-110 active:scale-95 cursor-pointer shadow-md border border-white/5"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % initialSlides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/45 hover:bg-black/65 text-white/80 hover:text-white backdrop-blur-xs transition-all z-30 hover:scale-110 active:scale-95 cursor-pointer shadow-md border border-white/5"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
        {initialSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              idx === current ? "w-8 bg-[#ff3f6c]" : "w-2.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
