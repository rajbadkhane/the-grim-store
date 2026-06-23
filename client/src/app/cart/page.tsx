"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cartLineKey, useCart } from "@/store/cart";
import { cartPageJsonLd } from "@/lib/seo";

export default function CartPage() {
  const { items, update, remove } = useCart();
  const router = useRouter();
  const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 79;

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] dark:bg-[#0A0A0A] dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cartPageJsonLd()) }} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Stage Progress Timeline */}
        <div className="mb-10 mx-auto max-w-lg flex items-center justify-center gap-4 border-b border-neutral-200/50 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--accent)] text-white text-[10px] font-heading font-black">1</span>
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[var(--accent)]">Bag</span>
          </div>
          <span className="h-[2px] w-12 sm:w-20 bg-[var(--accent)]/20 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-500 text-[10px] font-heading font-black">2</span>
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-neutral-400">Address</span>
          </div>
          <span className="h-[2px] w-12 sm:w-20 bg-neutral-200 dark:bg-neutral-800 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-500 text-[10px] font-heading font-black">3</span>
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-neutral-400">Payment</span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          
          {/* Cart Items List */}
          <section className="flex flex-col gap-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-5 border border-dashed border-[#e5bdb8] bg-white p-12 py-16 text-center shadow-sm dark:border-[#3a1f1f] dark:bg-[#130b0b]">
                <div className="flex h-14 w-14 items-center justify-center bg-[#FF3B30]/10 text-[#FF3B30]">
                  <ShoppingBag size={22} className="stroke-[2.5]" />
                </div>
                <h2 className="text-sm font-heading font-extrabold uppercase tracking-wider text-[#1a1c1c] dark:text-white">Your bag is empty</h2>
                <p className="max-w-sm text-xs font-semibold leading-relaxed text-[#5c403c] dark:text-white/60">
                  Browse the vault and add live catalog products to your shopping bag.
                </p>
                <Link href="/products" className="mt-2">
                  <button className="bg-[#FF3B30] px-6 py-2.5 text-xs font-heading font-extrabold uppercase tracking-widest text-white shadow-sm transition active:scale-95">
                    Explore Shop
                  </button>
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const lineKey = cartLineKey(item);
                const itemPrice = item.price ?? item.salePrice;
                const hasDiscount = itemPrice > item.salePrice;
                const discountPercentage = hasDiscount ? Math.round(((itemPrice - item.salePrice) / itemPrice) * 100) : 0;

                return (
                  <article
                    key={lineKey}
                    className="relative flex gap-4 border border-[#e5bdb8] bg-white p-4 shadow-sm dark:border-[#3a1f1f] dark:bg-[#130b0b]"
                  >
                    {/* Item Image */}
                    <div className="relative flex aspect-[4/5] w-20 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200/40 dark:border-transparent">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="96px" className="object-contain p-2" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-neutral-400">No Image</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between pr-8">
                      <div>
                        {item.brand && (
                          <span className="text-[9px] font-heading font-black uppercase tracking-widest text-[var(--accent)]">
                            {item.brand}
                          </span>
                        )}
                        <Link href={`/products/${item.slug}`} className="mt-0.5 block line-clamp-1 text-xs text-neutral-850 dark:text-white font-bold hover:text-[var(--accent)] transition">
                          {item.title}
                        </Link>
                        
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-neutral-450 uppercase tracking-wider">
                          <span>Size: <strong className="text-neutral-700 dark:text-neutral-300 font-extrabold">{item.size ?? "Standard"}</strong></span>
                          <span>Color: <strong className="text-neutral-700 dark:text-neutral-300 font-extrabold">{item.color ?? "Default"}</strong></span>
                        </div>
                      </div>

                      {/* Quantity Capsule and Pricing Row */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200/40 dark:border-neutral-800/40">
                        <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                          <button
                            aria-label="Decrease quantity"
                            className="p-1.5 px-3 text-neutral-400 transition hover:text-neutral-800 dark:hover:text-white"
                            onClick={() => update(lineKey, Math.max(1, item.quantity - 1))}
                          >
                            <Minus size={10} className="stroke-[2.5]" />
                          </button>
                          <span className="w-5 text-center text-xs font-extrabold text-neutral-800 dark:text-neutral-250">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            className="p-1.5 px-3 text-neutral-400 transition hover:text-neutral-800 dark:hover:text-white"
                            onClick={() => update(lineKey, item.quantity + 1)}
                          >
                            <Plus size={10} className="stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Prices inline */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-heading font-extrabold text-neutral-900 dark:text-white">{formatMoney(item.salePrice * item.quantity)}</span>
                          {hasDiscount && (
                            <>
                              <span className="text-[10px] text-neutral-400 line-through font-medium">{formatMoney(itemPrice * item.quantity)}</span>
                              <span className="text-[10px] font-bold text-[var(--accent)]">({discountPercentage}% OFF)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button (absolute top-right) */}
                    <button
                      aria-label="Remove item"
                      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-colors"
                      onClick={() => remove(lineKey)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </article>
                );
              })
            )}
          </section>

          {/* Order Summary Sidebar */}
          <aside className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 p-5 bg-white dark:bg-[#151B26] shadow-xs">
            <h2 className="border-b border-neutral-200/40 dark:border-neutral-800/60 pb-3 text-xs font-heading font-extrabold tracking-wider text-neutral-900 dark:text-white uppercase">
              Price Details ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
            </h2>
            
            {/* Promo Code input */}
            <div className="mt-4 border-b border-neutral-200/40 dark:border-neutral-800/60 pb-4">
              <label htmlFor="coupon" className="text-[10px] font-heading font-black uppercase tracking-widest text-[var(--accent)]">
                Apply Coupons
              </label>
              <div className="mt-2.5 flex gap-2">
                <input
                  id="coupon"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-neutral-900/60 px-3.5 py-2 text-xs font-semibold text-foreground outline-none transition placeholder:text-neutral-400 focus:border-[var(--accent)]"
                  placeholder="Enter Promo Code"
                />
                <button
                  type="button"
                  className="rounded-xl border border-[var(--accent)] px-4 text-xs font-heading font-extrabold text-[var(--accent)] uppercase hover:bg-[var(--accent)]/10 transition-colors cursor-pointer"
                  onClick={() => toast.success("GRIM40 applied successfully!")}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Calculations List */}
            <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-neutral-500">
              <Row label="Total MRP (Subtotal)" value={formatMoney(subtotal)} />
              <Row label="Shipping Fee" value={shipping ? formatMoney(shipping) : "FREE"} shippingFree={!shipping} />
              <Row label="Total Amount" value={formatMoney(subtotal + shipping)} strong />
            </div>

            {/* Checkout Trigger */}
            <button
            className="mt-6 flex min-h-11 w-full items-center justify-center bg-[#1a1c1c] text-xs font-heading font-extrabold uppercase tracking-widest text-white shadow-sm transition hover:bg-[#FF3B30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-[#FF3B30] dark:hover:text-white"
              disabled={!items.length}
              onClick={() => router.push("/checkout")}
            >
              Place Order <ArrowRight size={13} className="ml-1.5" />
            </button>
          </aside>
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-45 flex items-center justify-between gap-4 border-t border-[#e5bdb8] bg-white/97 p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-[#3a1f1f] dark:bg-[#0A0A0A]/97 lg:hidden">
          <div className="flex flex-col pl-2">
            <span className="text-[9px] font-heading font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 leading-none">Total Payable</span>
            <span className="text-sm font-heading font-extrabold text-[var(--accent)] mt-1">{formatMoney(subtotal + shipping)}</span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="flex h-11 max-w-[200px] flex-1 items-center justify-center bg-[#FF3B30] text-xs font-heading font-extrabold uppercase tracking-widest text-white transition"
          >
            Place Order
          </button>
        </div>
      )}
    </main>
  );
}

function Row({ label, value, strong, shippingFree }: { label: string; value: string; strong?: boolean; shippingFree?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${
        strong
          ? "mt-3 border-t border-neutral-200/40 dark:border-neutral-800/60 pt-3.5 text-sm font-heading font-extrabold text-neutral-900 dark:text-white"
          : "text-xs font-semibold text-neutral-500 dark:text-neutral-450"
      }`}
    >
      <span>{label}</span>
      <span className={shippingFree ? "text-red-500 font-bold" : strong ? "text-neutral-900 dark:text-white" : ""}>{value}</span>
    </div>
  );
}
