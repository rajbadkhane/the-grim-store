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
    <div className="min-h-[calc(100vh-4rem)] text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-electrox-blue">Secure cart</p>
        <h1 className="electrox-gradient-text mt-2 text-3xl font-black tracking-tight sm:text-5xl">Shopping Cart</h1>
        
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* Cart Items List */}
          <section className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="electrox-card flex flex-col items-center justify-center gap-4 rounded-3xl p-12 py-20 text-center bg-electrox-surface"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-electrox-elevated bg-electrox-bg-2 text-electrox-blue">
                    <ShoppingBag size={24} />
                  </div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Your cart is empty</h2>
                  <p className="max-w-sm text-xs font-semibold text-neutral-450 leading-5">
                    Looks like you haven't added anything yet. Explore premium electronics, smart gadgets, and high-performance accessories.
                  </p>
                  <Link href="/products" className="mt-2">
                    <Button variant="primary" className="px-8 font-black uppercase text-xs tracking-wider">
                      Explore Catalog
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
                      className="electrox-card grid grid-cols-[100px_1fr] gap-5 rounded-2xl p-4 bg-electrox-surface hover:border-electrox-blue shadow-sm hover:shadow-md sm:grid-cols-[128px_1fr_auto]"
                    >
                      {/* Item Image */}
                      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-neutral-50 dark:bg-[#121212]">
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill sizes="128px" className="object-contain p-2" />
                        ) : (
                          <span className="text-[10px] font-black uppercase text-neutral-450">No Image</span>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <Link href={`/products/${item.slug}`} className="text-sm font-black text-foreground transition hover:text-electrox-blue">
                            {item.title}
                          </Link>
                          <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold text-neutral-450">
                            <span>Variant: <strong className="text-foreground">{item.size ?? "Standard"}</strong></span>
                            <span className="text-neutral-450/40">|</span>
                            <span>Color: <strong className="text-foreground">{item.color ?? "Default"}</strong></span>
                          </p>
                          {item.sku && (
                            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-neutral-450">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                        
                        {/* Quantity Selector Capsule */}
                        <div className="mt-4 flex w-fit items-center rounded-xl border border-electrox-elevated bg-electrox-bg-2">
                          <button
                            aria-label="Decrease quantity"
                            className="rounded-l-xl p-1.5 px-3 text-neutral-450 transition hover:bg-electrox-elevated hover:text-foreground"
                            onClick={() => update(lineKey, Math.max(1, item.quantity - 1))}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-foreground">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            className="rounded-r-xl p-1.5 px-3 text-neutral-450 transition hover:bg-electrox-elevated hover:text-foreground"
                            onClick={() => update(lineKey, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Price and Delete Button */}
                      <div className="col-span-2 flex justify-between gap-3 border-t border-electrox-elevated pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <p className="text-sm font-black text-foreground">{formatMoney(item.salePrice * item.quantity)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            aria-label={`Buy ${item.title} now`}
                            className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 px-3 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition hover:shadow-md"
                            onClick={() => buyNow(item)}
                          >
                            <Zap size={11} /> Buy now
                          </button>
                          <button
                            aria-label="Remove item"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-neutral-450 border border-electrox-elevated bg-electrox-bg-2 hover:border-red-500/30 hover:text-red-500"
                            onClick={() => remove(lineKey)}
                          >
                            <Trash2 size={13} />
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
          <aside className="electrox-card h-fit rounded-2xl p-6 bg-electrox-surface border border-electrox-elevated shadow-sm">
            <h2 className="border-b border-electrox-elevated pb-3 text-sm font-black tracking-wider text-foreground uppercase">
              Order Summary
            </h2>
            
            {/* Promo Code input */}
            <div className="mt-5">
              <label htmlFor="coupon" className="text-[10px] font-black uppercase tracking-wider text-neutral-450">
                Promo Code
              </label>
              <input
                id="coupon"
                className="mt-2 w-full rounded-xl border border-electrox-elevated bg-electrox-bg-2 px-4 py-2 text-xs text-foreground outline-none transition placeholder:text-neutral-450 focus:border-electrox-blue"
                placeholder="Enter coupon code"
              />
            </div>

            {/* Calculations List */}
            <div className="mt-6 flex flex-col gap-1">
              <Row label="Subtotal" value={formatMoney(subtotal)} />
              <Row label="Shipping" value={shipping ? formatMoney(shipping) : "Free"} />
              <Row label="Total" value={formatMoney(subtotal + shipping)} strong />
            </div>

            {/* Checkout Trigger */}
            <Button
              className="mt-6 w-full py-3 text-xs font-black uppercase tracking-wider shadow-sm"
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
          ? "mt-3 border-t border-electrox-elevated pt-4 text-sm font-black text-foreground"
          : "text-xs text-neutral-450 font-semibold"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
