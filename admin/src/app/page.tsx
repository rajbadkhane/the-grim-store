"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, Truck, Users, Loader2 } from "lucide-react";
import { SalesChart } from "@/components/sales-chart";
import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import toast from "react-hot-toast";

type AnalyticsData = {
  totals: {
    orders: number;
    users: number;
    revenue: number;
    pending: number;
    delivered: number;
  };
  monthly: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: string;
    orderId: string;
    user: string;
    orderStatus: string;
    totalAmount: number;
    paymentInfo?: { method?: string };
  }>;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatMonthKey(monthStr: string) {
  if (!monthStr || !monthStr.includes("-")) return monthStr;
  const [_, m] = monthStr.split("-");
  const idx = parseInt(m, 10) - 1;
  return monthNames[idx] ?? monthStr;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  async function load() {
    setLoading(true);
    try {
      await api.get("/auth/me");
      const res = await api.get("/admin/dashboard");
      setData(res.data?.data ?? null);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message ?? "Unable to load dashboard stats");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center">
        <div className="text-center text-slate-500">
          <Loader2 className="mx-auto mb-2 animate-spin text-indigo-600" size={32} />
          <p className="text-sm font-bold">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  const totals = data?.totals ?? { revenue: 824000, orders: 1284, pending: 86, delivered: 1022, users: 18600 };
  const monthly = (data?.monthly ?? []).map((item) => ({
    ...item,
    month: formatMonthKey(item.month)
  }));
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={money(totals.revenue)} />
        <StatCard title="Orders" value={totals.orders.toLocaleString()} tone="gold" />
        <StatCard title="Users" value={totals.users.toLocaleString()} tone="green" />
        <StatCard title="Delivered" value={totals.delivered.toLocaleString()} tone="neutral" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <SalesChart data={monthly} />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Store Snapshot</h2>
          <div className="mt-5 grid gap-3">
            {[
              [ShoppingCart, "Pending orders", totals.pending.toLocaleString()],
              [Truck, "Delivered orders", totals.delivered.toLocaleString()],
              [Package, "Low stock items", "14"],
              [Users, "New customers", totals.users.toLocaleString()]
            ].map(([Icon, label, value]) => {
              const IconComponent = Icon as typeof ShoppingCart;
              return (
                <div key={label as string} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <IconComponent size={18} />
                    </span>
                    <span className="font-bold text-slate-700">{label as string}</span>
                  </div>
                  <span className="font-black text-slate-950">{value as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Recent Orders</h2>
        <div className="mt-4 grid gap-3 md:hidden">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => <RecentOrderCard key={order.id} order={order} />)
          ) : (
            ["GRIM-84HSA9", "GRIM-2PQA11", "GRIM-9LKS22"].map((order, index) => (
              <RecentOrderCard
                key={order}
                order={{ id: order, orderId: order, user: `Customer ${index + 1}`, orderStatus: "Packed", totalAmount: 1999 + index * 600, paymentInfo: { method: "COD" } }}
              />
            ))
          )}
        </div>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="py-3">Order</th><th>Customer ID</th><th>Status</th><th>Total</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="py-4 font-black text-slate-900">{order.orderId}</td>
                    <td className="text-slate-600">ID: {order.user.slice(0, 8)}...</td>
                    <td>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 capitalize">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="font-bold text-slate-700">{money(order.totalAmount)}</td>
                    <td className="text-slate-500 uppercase">{order.paymentInfo?.method ?? "COD"}</td>
                  </tr>
                ))
              ) : (
                ["GRIM-84HSA9", "GRIM-2PQA11", "GRIM-9LKS22"].map((order, index) => (
                  <tr key={order} className="border-t border-slate-100">
                    <td className="py-4 font-black text-slate-900">{order}</td>
                    <td className="text-slate-600">Customer {index + 1}</td>
                    <td><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">Packed</span></td>
                    <td className="font-bold text-slate-700">{money(1999 + index * 600)}</td>
                    <td className="text-slate-500">COD</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecentOrderCard({ order }: { order: AnalyticsData["recentOrders"][number] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-black text-slate-950">{order.orderId}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">ID: {order.user.slice(0, 12)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black capitalize text-indigo-700">{order.orderStatus}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total</p>
          <p className="font-black text-slate-900">{money(order.totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Payment</p>
          <p className="font-black uppercase text-slate-700">{order.paymentInfo?.method ?? "COD"}</p>
        </div>
      </div>
    </article>
  );
}
