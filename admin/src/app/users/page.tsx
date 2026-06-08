"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Loader2, Mail, MapPin, Phone, RefreshCcw, Search, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";

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
  addressType?: string;
  isDefault?: boolean;
};

type AdminUser = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  avatar?: string;
  wishlist: string[];
  cart: unknown[];
  addresses: Address[];
  emailVerified: boolean;
  isBlocked: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  stats?: {
    orderCount: number;
    totalSpent: number;
    lastOrderAt: string | null;
    addressCount: number;
    wishlistCount: number;
    cartCount: number;
  };
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data?.users ?? []);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) router.push("/login");
      else toast.error(error.response?.data?.message ?? "Unable to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return users.filter((user) => [user.name, user.email, user.phone, user.role].join(" ").toLowerCase().includes(value));
  }, [users, query]);

  const stats = useMemo(
    () => ({
      total: users.length,
      customers: users.filter((user) => user.role === "customer").length,
      admins: users.filter((user) => user.role === "admin").length,
      blocked: users.filter((user) => user.isBlocked).length
    }),
    [users]
  );

  async function toggleBlock(user: AdminUser) {
    setSavingId(user.id);
    try {
      const res = await api.patch(`/admin/users/${user.id}/block`);
      const next = res.data?.user as AdminUser;
      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, ...next, stats: item.stats } : item)));
      toast.success(next.isBlocked ? "User blocked" : "User unblocked");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to update user");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Customers</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Users</h2>
          <p className="mt-1 text-sm text-slate-500">Live customer profiles with address, order, cart, wishlist, and account status details.</p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total users" value={stats.total} />
        <Stat label="Customers" value={stats.customers} />
        <Stat label="Admins" value={stats.admins} />
        <Stat label="Blocked" value={stats.blocked} danger={stats.blocked > 0} />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full max-w-md items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users by name, email, phone" className="ml-2 w-full bg-transparent text-sm text-slate-800" />
          </label>
          <span className="text-sm font-bold text-slate-500">{filtered.length} visible</span>
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="mx-auto mb-2 animate-spin" /> Loading users
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="py-12 text-center text-sm font-bold text-slate-500">No users found.</p>}
        {!loading && (
          <div className="grid gap-4">
            {filtered.map((user) => <UserCard key={user.id} user={user} saving={savingId === user.id} onToggleBlock={toggleBlock} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${danger ? "text-red-600" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function UserCard({ user, saving, onToggleBlock }: { user: AdminUser; saving: boolean; onToggleBlock: (user: AdminUser) => void }) {
  const defaultAddress = user.addresses.find((address) => address.isDefault) ?? user.addresses[0];
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Unknown";
  const lastOrder = user.stats?.lastOrderAt ? new Date(user.stats.lastOrderAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No orders";

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-950 text-xl font-black text-white">
              {user.avatar ? <Image src={user.avatar} alt={user.name || user.email} width={56} height={56} className="h-full w-full object-cover" /> : (user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-950">{user.name || "Profile not completed"}</h3>
                <Badge tone={user.role === "admin" ? "indigo" : "slate"}>{user.role}</Badge>
                {user.emailVerified && <Badge tone="green">Verified</Badge>}
                {user.isBlocked && <Badge tone="red">Blocked</Badge>}
              </div>
              <div className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
                <span className="inline-flex items-center gap-2"><Mail size={15} /> {user.email}</span>
                <span className="inline-flex items-center gap-2"><Phone size={15} /> {user.phone || "Phone not added"}</span>
                <span className="inline-flex items-center gap-2"><UserRound size={15} /> Joined {joined}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Metric label="Orders" value={user.stats?.orderCount ?? 0} />
            <Metric label="Spent" value={money(user.stats?.totalSpent ?? 0)} />
            <Metric label="Wishlist" value={user.stats?.wishlistCount ?? user.wishlist.length} />
            <Metric label="Cart" value={user.stats?.cartCount ?? user.cart.length} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <MapPin size={17} className="text-indigo-600" /> Address & Activity
            </div>
            <button
              onClick={() => onToggleBlock(user)}
              disabled={saving || user.role === "admin"}
              className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50 ${
                user.isBlocked ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : user.isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
              {user.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p><span className="font-black text-slate-900">Addresses:</span> {user.stats?.addressCount ?? user.addresses.length}</p>
            <p><span className="font-black text-slate-900">Last order:</span> {lastOrder}</p>
            <p><span className="font-black text-slate-900">Last login:</span> {user.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "Not recorded"}</p>
          </div>
          {defaultAddress ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-black text-slate-900">{defaultAddress.fullName || user.name || "Saved address"} {defaultAddress.addressType ? `(${defaultAddress.addressType})` : ""}</p>
              <p className="mt-1">{[defaultAddress.house, defaultAddress.road].filter(Boolean).join(", ")}</p>
              <p>{[defaultAddress.city, defaultAddress.state, defaultAddress.pincode].filter(Boolean).join(", ")}</p>
              {defaultAddress.phone && <p className="mt-1 font-bold">{defaultAddress.phone}</p>}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500">No saved address yet.</p>
          )}
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "indigo" | "green" | "red" | "slate" }) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-200 text-slate-700"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${styles[tone]}`}>{children}</span>;
}
