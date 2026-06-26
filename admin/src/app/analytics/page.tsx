import { SalesChart } from "@/components/sales-chart";

export default function AnalyticsPage() {
  return (
    <div>
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Performance</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Store trend and funnel snapshots for quick operational checks.</p>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SalesChart />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Weekly Funnel</h2>
          <div className="mt-5 grid gap-4">
            {["Sessions", "Product views", "Add to cart", "Checkout", "Orders"].map((stage, index) => (
              <div key={stage}>
                <div className="mb-2 flex justify-between gap-3 text-sm font-bold text-slate-700"><span>{stage}</span><span>{90 - index * 13}%</span></div>
                <div className="h-2 rounded bg-slate-100"><div className="h-full rounded bg-indigo-600" style={{ width: `${90 - index * 13}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
