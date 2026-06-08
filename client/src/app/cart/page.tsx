"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { cartLineKey, useCart } from "@/store/cart";

export default function CartPage() {
  const { items, update, remove } = useCart();
  const router = useRouter();
  const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 79;

  function buyNow(item: (typeof items)[number]) {
    sessionStorage.setItem(
      "grim_checkout_intent",
      JSON.stringify({
        isDirect: true,
        item,
        createdAt: new Date().toISOString()
      })
    );
    router.push(`/checkout?product=${encodeURIComponent(item.slug)}`);
  }

  return (
    <div className="bg-white dark:bg-[#070707] text-neutral-900 dark:text-[#f7f3ef] transition-colors duration-300 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight">Shopping Cart</h1>
        
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart Items List */}
          <section className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.035] p-12 text-center flex flex-col items-center justify-center gap-4 py-20 shadow-inner"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-400 dark:text-white/30 ring-8 ring-neutral-50 dark:ring-transparent">
                    <ShoppingBag size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-white/80">Your cart is empty</h2>
                  <p className="text-sm text-neutral-500 dark:text-white/60 max-w-sm">
                    Looks like you haven't added anything to your cart yet. Explore our premium streetwear drops to find your fit.
                  </p>
                  <Link href="/products" className="mt-2">
                    <Button variant="primary" className="px-8 font-black uppercase text-xs tracking-wider">
                      Shop New Drops
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                items.map((item) => {
                  const lineKey = cartLineKey(item);
                  return (
                  <motion.article
                    key={lineKey}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-[100px_1fr] sm:grid-cols-[128px_1fr_auto] gap-5 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-white/20 transition duration-200"
                  >
                    {/* Item Image */}
                    <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-transparent flex items-center justify-center">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="128px" className="object-cover" />
                      ) : (
                        <span className="text-[10px] font-black text-neutral-400 uppercase">No Image</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`} className="font-bold text-base text-neutral-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition">
                          {item.title}
                        </Link>
                        <p className="mt-1.5 text-xs font-semibold text-neutral-500 dark:text-white/50 flex flex-wrap gap-x-2 gap-y-1">
                          <span>Size: <strong className="text-neutral-700 dark:text-white/80">{item.size ?? "One Size"}</strong></span>
                          <span className="text-neutral-300 dark:text-white/20">|</span>
                          <span>Color: <strong className="text-neutral-700 dark:text-white/80">{item.color ?? "Default"}</strong></span>
                        </p>
                        {item.sku && (
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-white/35">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Selector Capsule */}
                      <div className="mt-4 flex items-center rounded-md border border-neutral-250 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/40 w-fit shadow-inner">
                        <button
                          aria-label="Decrease quantity"
                          className="p-1.5 px-3 text-neutral-500 dark:text-white/60 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-l-md transition duration-150"
                          onClick={() => update(lineKey, Math.max(1, item.quantity - 1))}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-neutral-850 dark:text-white">{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          className="p-1.5 px-3 text-neutral-500 dark:text-white/60 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-r-md transition duration-150"
                          onClick={() => update(lineKey, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Price and Delete Button */}
                    <div className="col-span-2 sm:col-span-1 flex sm:flex-col justify-between sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 dark:border-transparent">
                      <p className="font-black text-base text-neutral-900 dark:text-white">{formatMoney(item.salePrice * item.quantity)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Buy ${item.title} now`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-500 transition duration-200 cursor-pointer"
                          onClick={() => buyNow(item)}
                        >
                          <Zap size={14} /> Buy now
                        </button>
                        <button
                          aria-label="Remove item"
                          className="h-9 w-9 flex items-center justify-center rounded-md text-neutral-400 dark:text-white/55 hover:bg-red-500/10 dark:hover:bg-red-650/15 hover:text-red-500 dark:hover:text-red-400 transition duration-200 cursor-pointer"
                          onClick={() => remove(lineKey)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                  );
                })
              )}
            </AnimatePresence>
          </section>

          {/* Order Summary Sidebar */}
          <aside className="h-fit rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.04] p-6 shadow-sm">
            <h2 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight border-b border-neutral-200 dark:border-white/10 pb-3">
              Order Summary
            </h2>
            
            {/* Persisted Coupon code input without black block */}
            <div className="mt-5">
              <label htmlFor="coupon" className="text-xs font-bold text-neutral-500 dark:text-white/50 uppercase tracking-wider">
                Promo Code
              </label>
              <input
                id="coupon"
                className="mt-1.5 w-full rounded-md border border-neutral-250 dark:border-white/10 bg-white dark:bg-black px-4 py-2.5 text-sm text-neutral-800 dark:text-white outline-none focus:border-red-500 transition shadow-inner placeholder:text-neutral-400 dark:placeholder:text-white/30"
                placeholder="Enter coupon code"
              />
            </div>

            {/* Calculations List */}
            <div className="mt-6 flex flex-col gap-1.5">
              <Row label="Subtotal" value={formatMoney(subtotal)} />
              <Row label="Shipping" value={shipping ? formatMoney(shipping) : "Free"} />
              <Row label="Total" value={formatMoney(subtotal + shipping)} strong />
            </div>

            {/* Checkout Trigger */}
            <Button
              className="mt-6 w-full py-3 font-black uppercase tracking-wider text-xs shadow-lg"
              disabled={!items.length}
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${
        strong
          ? "border-t border-neutral-200 dark:border-white/10 pt-4 mt-3 text-base font-black text-neutral-900 dark:text-white"
          : "text-sm text-neutral-500 dark:text-white/60"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
