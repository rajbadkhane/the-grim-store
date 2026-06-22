"use client";

import Link from "next/link";
import { CreditCard, Headphones, RefreshCcw, ShieldCheck, Truck, Zap, Mail, ArrowRight } from "lucide-react";

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["Catalog", "/products"],
      ["Trending", "/products?sort=popular"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"]
    ]
  },
  {
    title: "Support",
    links: [
      ["My Orders", "/account?tab=orders"],
      ["Track Order", "/account?tab=orders"],
      ["Shipping Policy", "/shipping-policy"],
      ["Returns", "/returns-and-exchange-policy"],
      ["Contact", "/contact-us"]
    ]
  },
  {
    title: "Trust",
    links: [
      ["Privacy", "/privacy-policy"],
      ["Refunds", "/refund-and-cancellation-policy"],
      ["Terms", "/terms-and-conditions"],
      ["Payment Security", "/payment-and-security"]
    ]
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about-us"],
      ["My Account", "/account"],
      ["Checkout Flow", "/checkout"],
      ["Help FAQ", "/faq"]
    ]
  }
];

const trustItems = [
  [Truck, "Fast Dispatch", "Shipment registration and tracking code provided instantly."],
  [RefreshCcw, "Easy Support", "Clear returns, exchange, and cancellation policies."],
  [CreditCard, "Secure Checkout", "Razorpay payments encrypted and verified on the server."],
  [ShieldCheck, "Buyer Trust", "Protected user account sessions and order history tracking."]
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-neutral-200/50 dark:border-neutral-800 bg-[#FFFFFF] dark:bg-[#0B0F19] pb-28 text-foreground lg:pb-14">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Bento Trust Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {trustItems.map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Truck;
            return (
              <div 
                key={title as string} 
                className="rounded-2xl border border-neutral-200/55 dark:border-neutral-800/80 bg-[#FAFAFA] dark:bg-neutral-900/40 p-4 sm:p-5 hover:border-[#FF6B35]/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                  <IconComponent size={20} />
                </div>
                <h3 className="mt-4 text-xs font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">{title as string}</h3>
                <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-450">{text as string}</p>
              </div>
            );
          })}
        </div>

        {/* Brand, Newsletter, and Links */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex flex-col justify-between">
            <div>
              <Link href="/" className="group inline-flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25">
                  <Zap size={18} className="fill-current" />
                </span>
                <div>
                  <span className="block text-sm font-heading font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white">THE GRIM STORE</span>
                  <span className="block text-[9px] font-semibold uppercase tracking-widest text-[#FF6B35]">Modern Families</span>
                </div>
              </Link>
              <p className="mt-4 max-w-sm text-xs sm:text-sm leading-6 text-neutral-500 dark:text-neutral-400 font-medium">
                Smarter kids toys, educational tech, wearables, and consoles designed for high-performance family play.
              </p>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="mt-8 rounded-2xl border border-neutral-200/55 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-neutral-900/40 p-5">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Mail size={14} className="text-[#FF6B35]" /> Join Our Newsletter
              </h4>
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">Get early deals, collection drops, and tips.</p>
              <form onSubmit={(e) => e.preventDefault()} className="mt-3.5 flex gap-2">
                <input 
                  type="email" 
                  placeholder="your.email@gmail.com" 
                  className="flex-grow rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-xs font-semibold outline-none focus:border-[#FF6B35] transition-colors"
                />
                <button type="submit" className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 transition active:scale-95">
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-8 lg:grid-cols-4" aria-label="Footer navigation">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-heading font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">{group.title}</h3>
                <div className="mt-4 flex flex-col gap-3 text-xs font-semibold text-neutral-500 dark:text-neutral-450">
                  {group.links.map(([label, href]) => (
                    <Link key={`${label}-${href}`} href={href} className="transition hover:text-[#FF6B35]">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Support Desk & Copyright */}
        <div className="mt-16 border-t border-neutral-200/50 dark:border-neutral-850 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex flex-col gap-1">
            <p className="font-heading font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Headphones size={13} className="text-[#FF6B35]" /> Support Desk: Monday to Saturday, 10:00 AM to 6:00 PM IST
            </p>
            <p>Copyright © {new Date().getFullYear()} The Grim Store. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-bold uppercase tracking-wider text-[10px]">
            <span className="text-neutral-400">UPI</span>
            <span className="text-neutral-400">CARDS</span>
            <span className="text-neutral-400">COD</span>
            <span className="text-neutral-400">RAZORPAY SECURE</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
