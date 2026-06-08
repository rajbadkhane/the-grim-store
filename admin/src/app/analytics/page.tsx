import { SalesChart } from "@/components/sales-chart";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-4xl font-black">Analytics</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SalesChart />
        <div className="rounded-md border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-xl font-black">Weekly Funnel</h2>
          <div className="mt-5 grid gap-4">
            {["Sessions", "Product views", "Add to cart", "Checkout", "Orders"].map((stage, index) => (
              <div key={stage}>
                <div className="mb-2 flex justify-between text-sm"><span>{stage}</span><span>{90 - index * 13}%</span></div>
                <div className="h-2 rounded bg-white/10"><div className="h-full rounded bg-red-600" style={{ width: `${90 - index * 13}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
