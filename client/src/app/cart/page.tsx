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
    <div className="min-h-[calc(100vh-4rem)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">Secure cart</p>
        <h1 className="electrox-gradient-text mt-2 text-3xl font-black tracking-tight sm:text-5xl">Shopping Cart</h1>
        
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart Items List */}
          <section className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="electrox-card flex flex-col items-center justify-center gap-4 rounded-[2rem] p-12 py-20 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-blue-200 shadow-[0_0_40px_rgba(59,130,246,0.18)]">
                    <ShoppingBag size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-white">Your cart is empty</h2>
                  <p className="max-w-sm text-sm text-slate-400">
                    Looks like you haven't added anything yet. Explore premium electronics, audio, smart gadgets, and accessories.
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
                    className="electrox-card grid grid-cols-[100px_1fr] gap-5 rounded-[1.5rem] p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:shadow-[0_24px_70px_rgba(59,130,246,0.12)] sm:grid-cols-[128px_1fr_auto]"
                  >
                    {/* Item Image */}
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="128px" className="object-contain p-2" />
                      ) : (
                        <span className="text-[10px] font-black uppercase text-slate-500">No Image</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`} className="text-base font-bold text-white transition hover:text-blue-200">
                          {item.title}
                        </Link>
                        <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">
                          <span>Variant: <strong className="text-slate-200">{item.size ?? "Standard"}</strong></span>
                          <span className="text-white/20">|</span>
                          <span>Color: <strong className="text-slate-200">{item.color ?? "Default"}</strong></span>
                        </p>
                        {item.sku && (
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Selector Capsule */}
                      <div className="mt-4 flex w-fit items-center rounded-2xl border border-white/10 bg-white/[0.045] shadow-inner">
                        <button
                          aria-label="Decrease quantity"
                          className="rounded-l-2xl p-1.5 px-3 text-slate-400 transition duration-150 hover:bg-white/10 hover:text-white"
                          onClick={() => update(lineKey, Math.max(1, item.quantity - 1))}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-white">{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          className="rounded-r-2xl p-1.5 px-3 text-slate-400 transition duration-150 hover:bg-white/10 hover:text-white"
                          onClick={() => update(lineKey, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Price and Delete Button */}
                    <div className="col-span-2 flex justify-between gap-3 border-t border-white/10 pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <p className="text-base font-black text-white">{formatMoney(item.salePrice * item.quantity)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Buy ${item.title} now`}
                          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 px-3 text-xs font-black uppercase tracking-wider text-white transition duration-200 hover:shadow-[0_0_28px_rgba(59,130,246,0.28)]"
                          onClick={() => buyNow(item)}
                        >
                          <Zap size={14} /> Buy now
                        </button>
                        <button
                          aria-label="Remove item"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl text-slate-400 transition duration-200 hover:bg-rose-500/10 hover:text-rose-300"
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
          <aside className="electrox-card h-fit rounded-[1.5rem] p-6">
            <h2 className="border-b border-white/10 pb-3 text-lg font-black tracking-tight text-white">
              Order Summary
            </h2>
            
            {/* Persisted Coupon code input without black block */}
            <div className="mt-5">
              <label htmlFor="coupon" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Promo Code
              </label>
              <input
                id="coupon"
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2.5 text-sm text-white shadow-inner outline-none transition placeholder:text-slate-500 focus:border-blue-300/60"
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
              className="mt-6 w-full py-3 text-xs font-black uppercase tracking-wider shadow-lg"
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
          ? "mt-3 border-t border-white/10 pt-4 text-base font-black text-white"
          : "text-sm text-slate-400"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
