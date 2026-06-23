"use client";

import Link from "next/link";
import { CreditCard, Instagram, Lock, Mail, Share2, ShieldCheck } from "lucide-react";

const shopLinks = [
  ["Electronic Items", "/products?category=electronic-items"],
  ["Kids Cameras", "/products?q=camera"],
  ["Game Sticks", "/products?q=game"],
  ["Audio", "/products?q=headphone"],
  ["Grooming", "/products?q=trimmer"],
  ["Accessories", "/products?q=dongle"]
];

const infoLinks = [
  ["Shipping Policy", "/shipping-policy"],
  ["Returns & Exchanges", "/returns-and-exchange-policy"],
  ["Contact Us", "/contact-us"],
  ["Terms of Service", "/terms-and-conditions"]
];

export function Footer() {
  return (
      <footer className="border-t border-[#e8d9d9] bg-white pb-[calc(var(--bottom-bar-h)+1.25rem+env(safe-area-inset-bottom))] pt-12 text-[#111111] shadow-[0_-12px_36px_rgba(80,24,24,0.08)] dark:border-[#FF3B30]/20 dark:bg-[#0A0A0A] dark:text-white dark:shadow-none lg:pb-8 lg:pt-14">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
          <div className="grid grid-cols-2 gap-x-7 gap-y-9 lg:grid-cols-[1.25fr_1.75fr] lg:gap-10">
            <div className="min-w-0">
              <Link href="/" className="inline-flex items-center gap-3 text-[#111111] dark:text-white" aria-label="The Grim Store home">
                <span className="relative h-12 w-12 shrink-0 overflow-visible sm:h-14 sm:w-14">
                  <img src="/logo.png" alt="" className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]" aria-hidden="true" />
                </span>
                <span className="grim-wordmark grim-wordmark-inline text-[18px] sm:text-[24px]">
                  <span className="grim-wordmark-kicker">The</span>
                  <span>Grim</span>
                  <span>Store</span>
                </span>
              </Link>
              <p className="mt-4 max-w-md text-[11px] leading-5 text-[#5f4a4a] dark:text-white/70 sm:text-xs sm:leading-6">
                The ultimate destination for useful electronic items: kids cameras, game sticks, wireless audio, grooming tools, and everyday accessories.
              </p>
              <div className="mt-5 flex gap-2 sm:mt-6 sm:gap-3">
                <Link href="#" className="grid h-8 w-8 place-items-center border border-[#e3d0d0] text-[#111111] hover:border-[#FF3B30] hover:bg-[#FF3B30] hover:text-white dark:border-white/25 dark:text-white sm:h-9 sm:w-9" aria-label="Share">
                  <Share2 size={15} />
                </Link>
                <Link href="mailto:support@thegrimstore.com" className="grid h-8 w-8 place-items-center border border-[#e3d0d0] text-[#111111] hover:border-[#FF3B30] hover:bg-[#FF3B30] hover:text-white dark:border-white/25 dark:text-white sm:h-9 sm:w-9" aria-label="Email">
                  <Mail size={15} />
                </Link>
                <Link href="#" className="grid h-8 w-8 place-items-center border border-[#e3d0d0] text-[#111111] hover:border-[#FF3B30] hover:bg-[#FF3B30] hover:text-white dark:border-white/25 dark:text-white sm:h-9 sm:w-9" aria-label="Instagram">
                  <Instagram size={15} />
                </Link>
              </div>
            </div>

            <div className="contents lg:grid lg:grid-cols-3 lg:gap-10">
              <nav aria-label="Shop footer links">
                <h6 className="font-mono text-xs font-black uppercase tracking-wider text-[#111111] dark:text-white">Shop</h6>
                <div className="mt-4 flex flex-col gap-2.5 text-xs font-semibold text-[#5f4a4a] dark:text-white/62">
                  {shopLinks.map(([label, href]) => (
                    <Link key={`${label}-${href}`} href={href} className={label === "Sale" ? "text-[#FF3B30]" : "text-[#5f4a4a] hover:text-[#FF3B30] dark:text-white/60"}>
                      {label}
                    </Link>
                  ))}
                </div>
              </nav>

              <nav aria-label="Information footer links">
                <h6 className="font-mono text-xs font-black uppercase tracking-wider text-[#111111] dark:text-white">Info</h6>
                <div className="mt-4 flex flex-col gap-2.5 text-xs font-semibold text-[#5f4a4a] dark:text-white/62">
                  {infoLinks.map(([label, href]) => (
                    <Link key={`${label}-${href}`} href={href} className="text-[#5f4a4a] hover:text-[#FF3B30] dark:text-white/60">
                      {label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="min-w-0">
                <h6 className="font-mono text-xs font-black uppercase tracking-wider text-[#111111] dark:text-white">Stay Grim</h6>
                <form onSubmit={(event) => event.preventDefault()} className="mt-4 flex flex-col gap-2 min-[420px]:flex-row lg:flex">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="min-w-0 flex-1 border border-[#e3d0d0] bg-white px-3 py-2.5 text-xs font-semibold text-[#111111] outline-none placeholder:text-[#9b8c8c] focus:border-[#FF3B30] dark:border-[#3a1f1f] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-white/35"
                  />
                  <button type="submit" className="bg-[#FF3B30] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white">
                    Join
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-[#eadede] pt-6 text-[10px] font-semibold uppercase tracking-wide text-[#756666] dark:border-[#3a1f1f] dark:text-white/60 md:flex-row md:items-center md:justify-between">
            <p>Copyright &copy; {new Date().getFullYear()} The Grim Store. Electronic items, gadgets &amp; accessories.</p>
            <Link href="https://gautamenterprises.org" target="_blank" rel="noopener noreferrer" className="text-center font-black text-[#111] hover:text-[#FF3B30] dark:text-white dark:hover:text-[#FF3B30]">
              Powered by Gautam Tech Studio
            </Link>
            <div className="flex gap-5">
              <CreditCard size={16} />
              <ShieldCheck size={16} />
              <Lock size={16} />
            </div>
          </div>
        </div>
      </footer>
  );
}
