"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Boxes, LayoutDashboard, LogOut, Menu, Percent, Search, Settings, ShoppingBag, Star, Tags, Users, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const nav = [
  [LayoutDashboard, "Dashboard", "/"],
  [Boxes, "Products", "/products"],
  [Tags, "Categories", "/categories"],
  [ShoppingBag, "Orders", "/orders"],
  [Star, "Reviews", "/reviews"],
  [Users, "Users", "/users"],
  [Percent, "Coupons", "/coupons"],
  [Settings, "Settings", "/settings"]
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  if (pathname === "/login") {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] lg:grid lg:grid-cols-[280px_1fr]">
      <button aria-label="Open admin menu" onClick={() => setMobile(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden">
        <Menu />
      </button>
      <aside className="sticky top-0 hidden h-screen border-r border-slate-200 bg-white p-6 lg:block">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {mobile && (
          <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-5 lg:hidden">
            <button aria-label="Close admin menu" className="mb-4 rounded-xl p-2 hover:bg-slate-100" onClick={() => setMobile(false)}>
              <X />
            </button>
            <SidebarContent onNavigate={() => setMobile(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
      <div className="min-w-0">
        <Topbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      router.push("/login");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="mb-10 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-lg font-black text-white">G</span>
        <span className="text-xl font-black text-slate-950">GrimAdmin</span>
      </Link>
      <p className="mb-3 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Menu</p>
      <nav className="grid gap-2">
        {nav.map(([Icon, label, href]) => {
          const IconComponent = Icon as typeof LayoutDashboard;
          const active = pathname === href;
          return (
            <Link
              key={href as string}
              href={href as string}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700",
                active && "bg-indigo-50 text-indigo-700"
              )}
            >
              <IconComponent size={19} />
              <span>{label as string}</span>
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100">
        <LogOut size={19} /> Logout
      </button>
    </div>
  );
}

function Topbar() {
  const pathname = usePathname();
  const title = nav.find((item) => item[2] === pathname)?.[1] ?? "Dashboard";
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-2xl font-black text-slate-950">{title as string}</h1>
          <p className="text-sm text-slate-500">The Grim Store ecommerce control panel</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="hidden min-w-72 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400 md:flex">
            <Search size={18} />
            <input className="ml-2 w-full bg-transparent text-sm text-slate-700" placeholder="Search products, orders..." />
          </label>
          <button aria-label="Notifications" className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">A</div>
            <span className="text-sm font-bold text-slate-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
