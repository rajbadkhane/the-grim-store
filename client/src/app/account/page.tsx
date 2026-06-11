"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import toast from "react-hot-toast";
import { Bell, Edit3, Heart, Loader2, MapPin, Package, RefreshCcw, Save, Truck, UserRound, X, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { useAuth } from "@/store/auth";

type Tab = "profile" | "orders" | "wishlist" | "addresses" | "notifications";

type UserProfile = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  emailVerified?: boolean;
};

type Address = {
  id: string;
  fullName?: string;
  phone?: string;
  pincode?: string;
  state?: string;
  city?: string;
  house?: string;
  road?: string;
  landmark?: string;
  addressType?: "home" | "work" | "other";
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";

type Order = {
  id: string;
  orderId: string;
  products: Array<{ title: string; quantity: number; size?: string; color?: string; sku?: string; image?: string }>;
  orderStatus: OrderStatus;
  trackingStatus: string;
  totalAmount: number;
  deliveryDate?: string;
  paymentStatus: string;
  paymentInfo?: Record<string, any>;
  createdAt?: string;
};

type LiveTracking = {
  provider: string;
  booked: boolean;
  awbNumber?: string | null;
  courierName?: string | null;
  label?: string | null;
  manifest?: string | null;
  status?: string | null;
  error?: string;
  history?: Array<{ status_code?: string; location?: string; event_time?: string; message?: string; status?: string; date?: string }>;
};

type WishlistProduct = {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  images?: Array<string | { url?: string }>;
};

export default function AccountPage() {
  const { openLoginModal, logout } = useAuth();
  const [active, setActive] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [meRes, addressRes, orderRes, wishlistRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/users/addresses"),
        api.get("/orders/mine"),
        api.get("/users/wishlist-products")
      ]);
      setProfile((meRes.data?.user ?? null) as UserProfile | null);
      setAddresses((addressRes.data?.addresses ?? []) as Address[]);
      setOrders((orderRes.data?.orders ?? []) as Order[]);
      setWishlist((wishlistRes.data?.products ?? []) as WishlistProduct[]);
      setLastUpdated(new Date());
    } catch {
      setProfile(null);
      setAddresses([]);
      setOrders([]);
      setWishlist([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (isTab(tab)) setActive(tab);
    load();
    const timer = window.setInterval(() => load(true), 15000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#070707] text-neutral-900 dark:text-[#f7f3ef] transition-colors duration-300 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-bold text-neutral-500 dark:text-white/50">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white dark:bg-[#070707] text-neutral-900 dark:text-[#f7f3ef] transition-colors duration-300 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="text-3xl font-black text-neutral-950 dark:text-white">Account Login Required</h1>
          <p className="mt-3 text-sm font-bold text-neutral-500 dark:text-white/50 leading-relaxed">
            Please authenticate to manage your profile, view orders, and access addresses.
          </p>
          <button
            onClick={openLoginModal}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 px-8 text-sm font-black text-white transition duration-200 shadow-lg cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#070707] text-neutral-900 dark:text-[#f7f3ef] transition-colors duration-300 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200 dark:border-white/10 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-950 dark:text-white">My Account</h1>
            <p className="mt-1 text-sm font-bold text-neutral-500 dark:text-white/50">
              Manage your profile details, track active shipments, view wishlist, and edit addresses.
            </p>
          </div>
          <button
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-250 dark:border-white/10 px-4 py-2 text-sm font-black text-neutral-800 dark:text-white hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-300 transition cursor-pointer"
          >
            <RefreshCcw size={16} /> Refresh Data
          </button>
        </div>

        {/* 2-Column Flipkart Style Layout */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* LEFT COLUMN: Sidebar Navigation */}
          <aside className="flex flex-col gap-4 h-fit">
            {/* User Greeting Block */}
            <div className="flex items-center gap-3.5 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-black text-lg border border-blue-500/20 shadow-inner flex-shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-450 dark:text-white/35 font-black uppercase tracking-wider">Hello,</p>
                <h2 className="text-base font-black text-neutral-900 dark:text-white truncate max-w-[180px]">
                  {profile.name || "Customer"}
                </h2>
              </div>
            </div>

            {/* Menu Blocks */}
            <div className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] shadow-sm divide-y divide-neutral-200 dark:divide-white/10 overflow-hidden">
              {/* My Orders Section */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActive("orders");
                    window.history.replaceState(null, "", `/account?tab=orders`);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-3 text-left text-sm font-black transition cursor-pointer ${
                    active === "orders"
                      ? "bg-blue-500/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 pl-2.5"
                      : "text-neutral-700 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400"
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Package size={18} className="text-blue-400 dark:text-blue-400" />
                    MY ORDERS
                  </span>
                  <span className="flex items-center gap-2">
                    {orders.length > 0 && <Count value={orders.length} />}
                    <ChevronRight size={14} className="opacity-50" />
                  </span>
                </button>
              </div>

              {/* Account Settings Section */}
              <div className="p-1.5">
                <div className="px-3.5 py-2 text-[10px] font-black text-neutral-450 dark:text-white/30 uppercase tracking-widest">
                  Account Settings
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  {[
                    { key: "profile", label: "Profile Information", icon: UserRound },
                    { key: "addresses", label: "Manage Addresses", icon: MapPin }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActive(item.key as Tab);
                        window.history.replaceState(null, "", `/account?tab=${item.key}`);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left text-sm font-bold transition cursor-pointer ${
                        active === item.key
                          ? "bg-blue-500/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 pl-2.5"
                          : "text-neutral-700 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400"
                      }`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <item.icon size={16} className={active === item.key ? "text-blue-500" : "text-neutral-400 dark:text-white/40"} />
                        {item.label}
                      </span>
                      {item.key === "addresses" && addresses.length > 0 && <Count value={addresses.length} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* My Stuff Section */}
              <div className="p-1.5">
                <div className="px-3.5 py-2 text-[10px] font-black text-neutral-450 dark:text-white/30 uppercase tracking-widest">
                  My Stuff
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  {[
                    { key: "wishlist", label: "My Wishlist", icon: Heart },
                    { key: "notifications", label: "Notifications", icon: Bell }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActive(item.key as Tab);
                        window.history.replaceState(null, "", `/account?tab=${item.key}`);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left text-sm font-bold transition cursor-pointer ${
                        active === item.key
                          ? "bg-blue-500/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 pl-2.5"
                          : "text-neutral-700 dark:text-white/80 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400"
                      }`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <item.icon size={16} className={active === item.key ? "text-blue-500" : "text-neutral-400 dark:text-white/40"} />
                        {item.label}
                      </span>
                      {item.key === "wishlist" && wishlist.length > 0 && <Count value={wishlist.length} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout Block */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                      toast.success("Successfully logged out");
                      window.location.href = "/";
                    } catch (e) {
                      toast.error("Logout failed");
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3.5 py-3 text-left text-sm font-black text-blue-400 dark:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                >
                  <X size={18} />
                  LOGOUT
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Tab Panel Contents */}
          <main className="flex flex-col gap-5">
            {active === "profile" && <ProfilePanel profile={profile} loading={loading} onSaved={(next) => setProfile(next)} />}
            {active === "orders" && <OrderHistory orders={orders} loading={loading} lastUpdated={lastUpdated} />}
            {active === "wishlist" && <WishlistPanel products={wishlist} loading={loading} />}
            {active === "addresses" && <SavedAddresses addresses={addresses} loading={loading} />}
            {active === "notifications" && <NotificationsPanel orders={orders} loading={loading} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="rounded bg-neutral-200 dark:bg-white/10 px-2 py-0.5 text-[10px] font-black text-neutral-700 dark:text-white/60">
      {value}
    </span>
  );
}

function ProfilePanel({ profile, loading, onSaved }: { profile: UserProfile | null; loading: boolean; onSaved: (profile: UserProfile) => void }) {
  const hasProfile = Boolean(profile?.name?.trim() && profile?.phone?.trim());
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", avatar: "" });

  useEffect(() => {
    setForm({ name: profile?.name ?? "", phone: profile?.phone ?? "", avatar: profile?.avatar ?? "" });
    setEditing(!hasProfile);
  }, [profile?.id, profile?.name, profile?.phone, profile?.avatar, hasProfile]);

  async function save() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch("/users/profile", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar.trim()
      });
      const next = (res.data?.user ?? null) as UserProfile | null;
      if (next) onSaved(next);
      setEditing(false);
      toast.success("Profile saved");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Panel title="Profile">
        <p className="text-sm font-bold text-neutral-500 dark:text-white/60">Loading profile...</p>
      </Panel>
    );
  }

  if (!profile) {
    return (
      <Panel title="Profile">
        <p className="text-sm font-bold text-neutral-500 dark:text-white/60">Login required to manage profile.</p>
      </Panel>
    );
  }

  if (!editing && hasProfile) {
    return (
      <Panel
        title="Profile"
        action={
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-250 dark:border-white/10 px-3.5 py-2 text-xs font-black text-neutral-800 dark:text-white hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-300 transition cursor-pointer"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        }
      >
        <div className="grid gap-5 sm:grid-cols-[96px_1fr] items-center">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-blue-600/15 text-3xl font-black text-blue-600 dark:text-blue-200">
            {profile.avatar ? (
              <Image src={profile.avatar} alt={profile.name ?? "Profile"} width={96} height={96} className="h-full w-full object-cover" />
            ) : (
              profile.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-neutral-950 dark:text-white">{profile.name}</h2>
            <p className="mt-2 text-sm font-bold text-neutral-500 dark:text-white/60">{profile.email}</p>
            <p className="mt-1 text-sm font-bold text-neutral-500 dark:text-white/60">{profile.phone}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-neutral-100 dark:bg-white/10 px-2.5 py-1 text-xs font-black text-neutral-600 dark:text-white/65 uppercase tracking-wide">
                {profile.role ?? "customer"}
              </span>
              {profile.emailVerified && (
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300 uppercase tracking-wide">
                  Verified email
                </span>
              )}
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={hasProfile ? "Edit Profile" : "Create Profile"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-black text-neutral-500 dark:text-white/75 uppercase tracking-wider">
          Full name
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="mt-2 w-full rounded-md border border-neutral-250 dark:border-white/10 bg-white dark:bg-black px-3.5 py-3 text-sm text-neutral-800 dark:text-white outline-none focus:border-blue-500 transition shadow-inner placeholder:text-neutral-450 dark:placeholder:text-white/30"
          />
        </label>
        <label className="text-xs font-black text-neutral-500 dark:text-white/75 uppercase tracking-wider">
          Phone
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="mt-2 w-full rounded-md border border-neutral-250 dark:border-white/10 bg-white dark:bg-black px-3.5 py-3 text-sm text-neutral-800 dark:text-white outline-none focus:border-blue-500 transition shadow-inner placeholder:text-neutral-450 dark:placeholder:text-white/30"
          />
        </label>
        <label className="text-xs font-black text-neutral-500 dark:text-white/75 uppercase tracking-wider sm:col-span-2">
          Avatar URL
          <input
            value={form.avatar}
            onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
            placeholder="Optional image URL"
            className="mt-2 w-full rounded-md border border-neutral-250 dark:border-white/10 bg-white dark:bg-black px-3.5 py-3 text-sm text-neutral-800 dark:text-white outline-none focus:border-blue-500 transition shadow-inner placeholder:text-neutral-450 dark:placeholder:text-white/30"
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 px-6 text-sm font-black text-white disabled:opacity-60 transition cursor-pointer shadow-lg shadow-blue-500/10"
        >
          {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Save details
        </button>
        {hasProfile && (
          <button
            onClick={() => setEditing(false)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-neutral-250 dark:border-white/10 bg-transparent px-6 text-sm font-black text-neutral-700 dark:text-white/70 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-300 transition cursor-pointer"
          >
            <X size={17} /> Cancel
          </button>
        )}
      </div>
    </Panel>
  );
}

function OrderHistory({ orders, loading, lastUpdated }: { orders: Order[]; loading: boolean; lastUpdated: Date | null }) {
  return (
    <Panel
      title="Order History"
      badge={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
      subtitle={lastUpdated ? `Live status synced: ${lastUpdated.toLocaleTimeString()}` : "Track delivery milestones"}
    >
      <div className="grid gap-5">
        {loading && <p className="text-sm font-bold text-neutral-500 dark:text-white/60">Loading orders...</p>}
        {!loading && orders.length === 0 && (
          <p className="text-sm font-bold text-neutral-500 dark:text-white/60">
            No orders yet. Your parcel tracking will appear here after checkout.
          </p>
        )}
        {!loading && orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </Panel>
  );
}

function OrderCard({ order }: { order: Order }) {
  const delivery = order.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Pending";
  const [tracking, setTracking] = useState<LiveTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const awbNumber = order.paymentInfo?.nimbuspostAwbNumber ?? order.paymentInfo?.shiprocketAwbCode ?? null;
  const courierName = order.paymentInfo?.nimbuspostCourierName ?? (awbNumber ? "Nimbuspost" : null);
  const labelUrl = order.paymentInfo?.nimbuspostLabel ?? null;
  const paymentMethod = String(order.paymentInfo?.method ?? "online").toUpperCase();

  async function loadTracking() {
    if (trackingLoading) return;
    setTrackingLoading(true);
    try {
      const res = await api.get(`/orders/${order.id}/track`);
      const nextTracking = (res.data?.tracking ?? null) as LiveTracking | null;
      setTracking(nextTracking);
      if (nextTracking?.error) toast.error(nextTracking.error);
      else toast.success("Tracking updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to fetch tracking");
    } finally {
      setTrackingLoading(false);
    }
  }

  return (
    <article className="rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/10 hover:shadow-md transition-all duration-200 p-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-white/5 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-white/35">Order ID</span>
          <p className="text-sm font-black text-neutral-900 dark:text-white font-mono">{order.orderId}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
            <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-600 dark:bg-white/5 dark:text-white/60">Payment {paymentMethod}</span>
            {courierName && <span className="rounded bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{courierName}</span>}
            {awbNumber && <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">AWB {awbNumber}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          {order.createdAt && (
            <span className="text-xs font-bold text-neutral-500 dark:text-white/50">
              Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <span className={`rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
            order.orderStatus === "delivered"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
              : order.orderStatus === "cancelled" || order.orderStatus === "refunded"
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-300"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-300"
          }`}>
            {statusLabel(order.orderStatus)}
          </span>
        </div>
      </div>

      {/* Card Body Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_240px_220px]">
        {/* Column 1: Products list */}
        <div className="flex flex-col gap-4">
          {order.products.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start pb-4 last:pb-0 last:border-0 border-b border-neutral-100 dark:border-white/5">
              {/* Product Image */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] font-black text-neutral-400 uppercase">IMG</div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-neutral-900 dark:text-white truncate">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs font-bold text-neutral-500 dark:text-white/50 flex flex-wrap gap-x-2 gap-y-0.5">
                  {item.size && <span>Size: <strong className="text-neutral-700 dark:text-white/80">{item.size}</strong></span>}
                  {item.size && item.color && <span className="text-neutral-300 dark:text-white/20">|</span>}
                  {item.color && <span>Color: <strong className="text-neutral-700 dark:text-white/80">{item.color}</strong></span>}
                  <span>Qty: <strong className="text-neutral-700 dark:text-white/80">{item.quantity}</strong></span>
                </p>
                {item.sku && <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30">SKU: {item.sku}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: Order Price & Payment details */}
        <div className="rounded-md border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.015] p-4 flex flex-col justify-between h-full">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-white/35">Payment Details</span>
            <div className="mt-2.5 flex justify-between text-xs font-bold text-neutral-500 dark:text-white/50">
              <span>Payment Status:</span>
              <span className={`uppercase font-black ${order.paymentStatus === "paid" ? "text-emerald-650 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{order.paymentStatus}</span>
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-neutral-500 dark:text-white/50">
              <span>Expected Delivery:</span>
              <span className="text-neutral-800 dark:text-white font-black">{delivery}</span>
            </div>
            {awbNumber && (
              <div className="mt-2 flex justify-between gap-2 text-xs font-bold text-neutral-500 dark:text-white/50">
                <span>AWB:</span>
                <span className="text-right font-black text-neutral-800 dark:text-white">{awbNumber}</span>
              </div>
            )}
          </div>
          <div className="mt-4 border-t border-neutral-200 dark:border-white/5 pt-3.5 flex items-center justify-between text-sm font-black text-neutral-900 dark:text-white">
            <span>Total Paid</span>
            <span className="text-blue-600 dark:text-blue-300 text-base">{formatMoney(order.totalAmount)}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {labelUrl && (
              <a href={labelUrl} target="_blank" rel="noreferrer" className="rounded-md border border-neutral-200 px-3 py-2 text-center text-[11px] font-black text-neutral-700 hover:border-blue-500 hover:text-blue-500 dark:border-white/10 dark:text-white/70">
                Label
              </a>
            )}
            <button onClick={loadTracking} disabled={trackingLoading} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-[11px] font-black text-white disabled:opacity-60">
              {trackingLoading ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />}
              Live
            </button>
          </div>
        </div>

        {/* Column 3: Order Tracking Timeline */}
        <div className="border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-white/5 pt-4 lg:pt-0 lg:pl-6">
          <span className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-white/35 mb-3">
            Track Shipment
          </span>
          <TrackingTimeline order={order} />
          {tracking && (
            <div className="mt-5 rounded-md border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-white/35">Carrier tracking</p>
                  <p className="mt-1 text-sm font-black text-neutral-900 dark:text-white">{tracking.status || order.trackingStatus}</p>
                </div>
                {tracking.awbNumber && <span className="rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300">AWB {tracking.awbNumber}</span>}
              </div>
              {tracking.error && <p className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-300">{tracking.error}</p>}
              {!tracking.error && tracking.history?.length ? (
                <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
                  {tracking.history.slice(0, 8).map((event, index) => (
                    <div key={`${event.event_time ?? event.date ?? index}-${index}`} className="border-l-2 border-emerald-500/40 pl-3">
                      <p className="text-xs font-black text-neutral-900 dark:text-white">{event.message ?? event.status ?? "Shipment update"}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-neutral-500 dark:text-white/45">{[event.location, event.event_time ?? event.date].filter(Boolean).join(" | ")}</p>
                    </div>
                  ))}
                </div>
              ) : (
                !tracking.error && <p className="mt-3 text-xs font-bold text-neutral-500 dark:text-white/45">Live carrier scans will appear after pickup.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function getStepDate(order: Order, stepKey: OrderStatus) {
  const baseDate = order.createdAt ? new Date(order.createdAt) : new Date();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  switch (stepKey) {
    case "placed":
      return formatDate(baseDate);
    case "confirmed":
      const conf = new Date(baseDate);
      conf.setHours(conf.getHours() + 12);
      return formatDate(conf);
    case "packed":
      const pack = new Date(baseDate);
      pack.setDate(pack.getDate() + 1);
      return formatDate(pack);
    case "shipped":
      const ship = new Date(baseDate);
      ship.setDate(ship.getDate() + 2);
      return formatDate(ship);
    case "delivered":
      if (order.deliveryDate) {
        return formatDate(new Date(order.deliveryDate));
      }
      const deliv = new Date(baseDate);
      deliv.setDate(deliv.getDate() + 4);
      return formatDate(deliv);
    default:
      return "";
  }
}

function TrackingTimeline({ order }: { order: Order }) {
  const steps = [
    { key: "placed", label: "Order Placed" },
    { key: "confirmed", label: "Order Confirmed" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: order.orderStatus === "delivered" ? "Delivered" : "Expected Delivery" }
  ];

  const currentIndex = steps.findIndex((step) => step.key === order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const isRefunded = order.orderStatus === "refunded";

  if (isCancelled || isRefunded) {
    return (
      <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-4 text-sm font-bold text-blue-600 dark:text-blue-400">
        This order has been {isCancelled ? "Cancelled" : "Refunded"}.
        {order.createdAt && (
          <p className="mt-1 text-xs font-normal text-neutral-500 dark:text-white/45">
            Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isNextCompleted = index + 1 <= currentIndex;
        const stepDate = getStepDate(order, step.key as OrderStatus);

        return (
          <div key={step.key} className="relative pl-6 flex flex-col gap-0.5">
            {/* Connecting Line Segment */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-[7px] top-[18px] w-0.5 h-[calc(100%+8px)] transition-all duration-300 ${
                  isNextCompleted
                    ? "bg-emerald-500"
                    : "bg-neutral-200 dark:bg-white/10"
                }`}
              />
            )}

            {/* Timeline Circle Node */}
            <div
              className={`absolute left-0 top-1 h-[16px] w-[16px] rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : isCurrent
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white dark:bg-[#101010] border-neutral-350 dark:border-white/20"
              }`}
            >
              {isCompleted && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!isCompleted && isCurrent && (
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              )}
            </div>

            {/* Step Label and Date */}
            <div>
              <p className={`text-xs font-black transition-colors ${
                isCompleted
                  ? "text-neutral-900 dark:text-white"
                  : isCurrent
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-neutral-400 dark:text-white/30"
              }`}>
                {step.label}
              </p>
              {stepDate && (
                <p className="text-[10px] font-bold text-neutral-500 dark:text-white/45">
                  {step.key === "delivered" && !isCompleted ? "Expected by: " : ""}{stepDate}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WishlistPanel({ products, loading }: { products: WishlistProduct[]; loading: boolean }) {
  return (
    <Panel title="Wishlist" badge={`${products.length} item${products.length === 1 ? "" : "s"}`}>
      {loading && <p className="text-sm font-bold text-neutral-500 dark:text-white/60">Loading wishlist...</p>}
      {!loading && products.length === 0 && <p className="text-sm font-bold text-neutral-500 dark:text-white/60">No wishlist items yet.</p>}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/20 p-3 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-transparent">
                  {productImage(product) ? (
                    <Image src={productImage(product)} alt={product.title} fill sizes="(max-width: 768px) 50vw, 240px" className="object-cover group-hover:scale-105 transition duration-350" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-black text-neutral-400 dark:text-white/35">IMG</div>
                  )}
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-black text-neutral-900 dark:text-white group-hover:text-blue-500 transition duration-150">{product.title}</p>
                <p className="mt-1 text-xs font-bold text-neutral-500 dark:text-white/45">{product.brand ?? "The Grim Store"}</p>
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t border-neutral-150 dark:border-white/5 pt-2.5">
                {product.salePrice ? <p className="text-sm font-black text-blue-600 dark:text-blue-300">{formatMoney(product.salePrice)}</p> : null}
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 dark:text-blue-400 hover:underline">View Details</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

function SavedAddresses({ addresses, loading }: { addresses: Address[]; loading: boolean }) {
  const rendered = useMemo(
    () =>
      addresses.map((a) => {
        const line1 = `${a.house ?? ""}${a.house ? ", " : ""}${a.road ?? ""}`.trim().replace(/,\s*$/, "");
        const line2 = [a.city, a.state].filter(Boolean).join(", ");
        const line3 = a.pincode ? `PIN ${a.pincode}` : "";
        return { ...a, line1, line2, line3 };
      }),
    [addresses]
  );

  return (
    <Panel title="Saved Addresses" badge={`${addresses.length} address${addresses.length === 1 ? "" : "es"}`}>
      <div className="grid gap-3.5">
        {loading && <p className="text-sm font-bold text-neutral-500 dark:text-white/60">Loading addresses...</p>}
        {!loading && addresses.length === 0 && (
          <p className="text-sm font-bold text-neutral-500 dark:text-white/60">
            No saved addresses yet. Add one from Checkout.
          </p>
        )}
        {!loading &&
          rendered.map((a) => (
            <div key={a.id} className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/20 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2 flex-wrap">
                  {a.fullName ?? "Address"}{" "}
                  {a.addressType ? (
                    <span className="rounded-full bg-neutral-200/60 dark:bg-white/10 px-2 py-0.5 text-[10px] font-black text-neutral-600 dark:text-white/50 uppercase tracking-wider">
                      {a.addressType}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-neutral-700 dark:text-white/70 font-semibold">{a.line1 || "-"}</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-white/55 font-medium">{a.line2 || "-"}</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-white/55 font-medium">{a.line3 || ""}</p>
                {a.phone ? <p className="mt-2 text-xs font-bold text-neutral-500 dark:text-white/45">{a.phone}</p> : null}
              </div>
              {a.isDefault ? (
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-wider self-start sm:self-auto">
                  Default
                </span>
              ) : null}
            </div>
          ))}
      </div>
    </Panel>
  );
}

function NotificationsPanel({ orders, loading }: { orders: Order[]; loading: boolean }) {
  const notifications = orders.slice(0, 8).map((order) => ({
    id: order.id,
    title: `${order.orderId} is ${statusLabel(order.orderStatus)}`,
    text: order.trackingStatus || "Parcel status updated",
    time: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Recent"
  }));

  return (
    <Panel title="Notifications" badge={`${notifications.length} update${notifications.length === 1 ? "" : "s"}`}>
      {loading && <p className="text-sm font-bold text-neutral-500 dark:text-white/60">Loading notifications...</p>}
      {!loading && notifications.length === 0 && (
        <p className="text-sm font-bold text-neutral-500 dark:text-white/60">No notifications yet.</p>
      )}
      {!loading && (
        <div className="grid gap-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/20 p-4">
              <p className="text-sm font-black text-neutral-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-sm text-neutral-650 dark:text-white/58">{item.text}</p>
              <p className="mt-2 text-xs font-bold text-neutral-450 dark:text-white/35">{item.time}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Panel({
  title,
  subtitle,
  badge,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-950 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-xs font-bold text-neutral-500 dark:text-white/45">{subtitle}</p>}
        </div>
        {action}
        {badge && !action && (
          <span className="w-fit rounded bg-neutral-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-black text-neutral-700 dark:text-white/60 uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function productImage(product: WishlistProduct) {
  if (product.image) return product.image;
  const first = product.images?.[0];
  return typeof first === "string" ? first : first?.url ?? "";
}

function isTab(value: string | null): value is Tab {
  return value === "profile" || value === "orders" || value === "wishlist" || value === "addresses" || value === "notifications";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
