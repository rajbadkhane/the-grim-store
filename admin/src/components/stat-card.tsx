import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, tone = "red" }: { title: string; value: string; tone?: "red" | "gold" | "green" | "neutral" }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tone === "red" && "bg-indigo-50 text-indigo-600", tone === "gold" && "bg-orange-50 text-orange-500", tone === "green" && "bg-emerald-50 text-emerald-600", tone === "neutral" && "bg-sky-50 text-sky-600")}>
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
