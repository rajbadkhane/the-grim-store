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
    <main className="mobile-bottom-safe min-h-screen bg-transparent text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cartPageJsonLd()) }} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Stage Progress Timeline */}
        <div className="mb-10 mx-auto max-w-lg flex items-center justify-center gap-4 border-b border-neutral-200/50 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#FF6B35] text-white text-[10px] font-heading font-black">1</span>
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#FF6B35]">Bag</span>
          </div>
          <span className="h-[2px] w-12 sm:w-20 bg-[#FF6B35]/20 shrink-0" />
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
              <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 py-16 text-center bg-white dark:bg-neutral-900/30 shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]">
                  <ShoppingBag size={22} className="stroke-[2.5]" />
                </div>
                <h2 className="text-sm font-heading font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Your bag is empty</h2>
                <p className="max-w-sm text-xs font-semibold text-neutral-500 leading-relaxed">
                  Browse our high quality smart toys, retro gaming gear, and tech wearables to fill your shopping bag.
                </p>
                <Link href="/products" className="mt-2">
                  <button className="px-6 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-heading font-extrabold uppercase text-xs tracking-widest shadow-sm transition active:scale-95 cursor-pointer">
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
                    className="relative flex gap-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 p-4 shadow-xs"
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
                          <span className="text-[9px] font-heading font-black uppercase tracking-widest text-[#FF6B35]">
                            {item.brand}
                          </span>
                        )}
                        <Link href={`/products/${item.slug}`} className="mt-0.5 block line-clamp-1 text-xs text-neutral-850 dark:text-white font-bold hover:text-[#FF6B35] transition">
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
                              <span className="text-[10px] font-bold text-[#FF6B35]">({discountPercentage}% OFF)</span>
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
              <label htmlFor="coupon" className="text-[10px] font-heading font-black uppercase tracking-widest text-[#FF6B35]">
                Apply Coupons
              </label>
              <div className="mt-2.5 flex gap-2">
                <input
                  id="coupon"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-neutral-900/60 px-3.5 py-2 text-xs font-semibold text-foreground outline-none transition placeholder:text-neutral-400 focus:border-[#FF6B35]"
                  placeholder="Enter Promo Code"
                />
                <button
                  type="button"
                  className="rounded-xl border border-[#FF6B35] px-4 text-xs font-heading font-extrabold text-[#FF6B35] uppercase hover:bg-[#FF6B35]/10 transition-colors cursor-pointer"
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
              className="mt-6 w-full flex min-h-11 items-center justify-center rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              disabled={!items.length}
              onClick={() => router.push("/checkout")}
            >
              Place Order <ArrowRight size={13} className="ml-1.5" />
            </button>
          </aside>
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 z-45 border-t border-neutral-200/60 dark:border-neutral-800 bg-white/97 dark:bg-[#0B0F19]/97 p-3.5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden flex items-center justify-between gap-4">
          <div className="flex flex-col pl-2">
            <span className="text-[9px] font-heading font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 leading-none">Total Payable</span>
            <span className="text-sm font-heading font-extrabold text-[#FF6B35] mt-1">{formatMoney(subtotal + shipping)}</span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="flex-1 max-w-[200px] h-11 flex items-center justify-center bg-[#FF6B35] text-xs font-heading font-extrabold text-white rounded-xl uppercase tracking-widest transition"
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
      <span className={shippingFree ? "text-emerald-500 font-bold" : strong ? "text-neutral-900 dark:text-white" : ""}>{value}</span>
    </div>
  );
}
