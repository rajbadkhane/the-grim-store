import Link from "next/link";
import { CreditCard, Headphones, RefreshCcw, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";

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
      ["About", "/about-us"],
      ["Account", "/account"],
      ["Checkout", "/checkout"],
      ["FAQ", "/faq"]
    ]
  }
];

const trustItems = [
  [Truck, "Fast Dispatch", "Shipment registration and tracking after confirmation."],
  [RefreshCcw, "Easy Support", "Clear returns, refunds, and cancellation policies."],
  [CreditCard, "Secure Checkout", "Razorpay payments verified on the server."],
  [ShieldCheck, "Buyer Trust", "Protected sessions and account order history."]
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(59,130,246,0.18),transparent_24rem),radial-gradient(circle_at_88%_80%,rgba(168,85,247,0.16),transparent_26rem)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Truck;
            return (
              <div key={title as string} data-reveal className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-500/10">
                <IconComponent size={23} className="text-blue-200" />
                <h2 className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-white">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/[0.055] text-blue-200">
                <Zap size={21} />
              </span>
              <span>
                <span className="block text-lg font-black uppercase tracking-[0.25em]">The Grim</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.34em] text-slate-500">Electronics</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Premium electronics store with fast checkout, live inventory, secure payments, and delivery tracking.
            </p>
            <div className="mt-6 rounded-3xl border border-blue-300/20 bg-blue-500/10 p-5 shadow-[0_0_40px_rgba(59,130,246,0.14)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-black text-blue-100">
                <Headphones size={18} />
                Support Desk
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">Monday to Saturday, 10:00 AM to 6:00 PM IST</p>
              <Link href="/contact-us" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200 hover:text-white">
                Contact support <Sparkles size={14} />
              </Link>
            </div>
          </div>

          <nav className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Footer navigation">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white">{group.title}</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-500">
                  {group.links.map(([label, href]) => (
                    <Link key={`${label}-${href}`} href={href} className="transition hover:text-blue-200">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} The Grim Store. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>UPI</span>
            <span>Cards</span>
            <span>COD</span>
            <span>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
