import Link from "next/link";
import { CreditCard, Headphones, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["New Drops", "/products"],
      ["Bestsellers", "/products?sort=popular"],
      ["All Products", "/products"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"]
    ]
  },
  {
    title: "Customer Care",
    links: [
      ["My Orders", "/account?tab=orders"],
      ["Track Order", "/account?tab=orders"],
      ["Shipping Policy", "/shipping-policy"],
      ["Returns and Exchange", "/returns-and-exchange-policy"],
      ["FAQ", "/faq"],
      ["Contact Us", "/contact-us"]
    ]
  },
  {
    title: "Policies",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Refund and Cancellation", "/refund-and-cancellation-policy"],
      ["Terms and Conditions", "/terms-and-conditions"],
      ["Payment and Security", "/payment-and-security"],
      ["Cookie Policy", "/cookie-policy"]
    ]
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about-us"],
      ["Account", "/account"],
      ["Checkout", "/checkout"],
      ["Sitemap", "/sitemap.xml"],
      ["Robots", "/robots.txt"]
    ]
  }
];

const trustItems = [
  [Truck, "Fast Dispatch", "Ready-stock orders move quickly with clear delivery estimates."],
  [RefreshCcw, "Easy Support", "Return, exchange, refund, and cancellation policies are easy to find."],
  [CreditCard, "Secure Checkout", "Payment status and order records are verified on the server."],
  [ShieldCheck, "Buyer Trust", "Verified reviews, protected sessions, and admin-managed order status."]
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#050505] text-[#1a1a1a] dark:text-[#f7f3ef] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Truck;
            return (
              <div key={title as string} className="rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-4 shadow-sm dark:shadow-none">
                <IconComponent size={22} className="text-red-500 dark:text-red-400" />
                <h2 className="mt-4 text-sm font-black text-neutral-900 dark:text-white">{title as string}</h2>
                <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-white/52">{text as string}</p>
              </div>
            );
          })}
        </div>

        {/* Navigation Links and Logo */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex text-xl font-black tracking-wide text-neutral-950 dark:text-white">
              THE <span className="mx-1 text-red-500">GRIM</span> STORE
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-500 dark:text-white/58">
              Premium streetwear, limited drops, fast checkout, verified reviews, and transparent ecommerce policies for confident shopping.
            </p>
            <div className="mt-5 rounded-md border border-red-500/20 dark:border-red-500/30 bg-red-500/5 dark:bg-red-600/10 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-red-600 dark:text-red-300">
                <Headphones size={18} />
                Support
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-white/56">
                Monday to Saturday, 10:00 AM to 6:00 PM IST
              </p>
              <Link href="/contact-us" className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-500 dark:text-red-300 hover:text-red-650 dark:hover:text-red-200 transition">
                Contact support
              </Link>
            </div>
          </div>

          <nav className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Footer navigation">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-neutral-800 dark:text-white">{group.title}</h2>
                <div className="mt-4 grid gap-3 text-sm text-neutral-500 dark:text-white/58">
                  {group.links.map(([label, href]) => {
                    const externalFile = href.endsWith(".xml") || href.endsWith(".txt");
                    const elementKey = `${label}-${href}`;
                    if (externalFile) {
                      return (
                        <a key={elementKey} href={href} className="hover:text-red-500 dark:hover:text-red-300 transition">
                          {label}
                        </a>
                      );
                    }
                    return (
                      <Link key={elementKey} href={href} className="hover:text-red-500 dark:hover:text-red-300 transition">
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 dark:border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-400 dark:text-white/42">Copyright {new Date().getFullYear()} The Grim Store. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-400 dark:text-white/42">
            <span>Secure payments</span>
            <span>Verified buyer reviews</span>
            <span>Server-validated coupons</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
