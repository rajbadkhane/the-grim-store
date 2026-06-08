"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fallbackData = [
  { month: "Jan", revenue: 120000, orders: 120 },
  { month: "Feb", revenue: 168000, orders: 166 },
  { month: "Mar", revenue: 146000, orders: 141 },
  { month: "Apr", revenue: 238000, orders: 218 },
  { month: "May", revenue: 294000, orders: 276 },
  { month: "Jun", revenue: 360000, orders: 342 }
];

export function SalesChart({ data = [] }: { data?: Array<{ month: string; revenue: number; orders: number }> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = data && data.length ? data : fallbackData;

  if (!mounted) {
    return (
      <div className="h-80 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-black text-slate-950">Monthly Sales</h2>
        <div className="h-[82%] animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="h-80 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-black text-slate-950">Monthly Sales</h2>
      <ResponsiveContainer width="100%" height="82%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#635bff" stopOpacity={0.75} />
              <stop offset="95%" stopColor="#635bff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", color: "#111827", borderRadius: 12 }} />
          <Area type="monotone" dataKey="revenue" stroke="#635bff" fillOpacity={1} fill="url(#sales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
