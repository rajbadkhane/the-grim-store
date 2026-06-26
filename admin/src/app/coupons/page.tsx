"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CalendarClock, Loader2, Percent, RefreshCcw, Save, ShieldCheck, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  value: number;
  expiryDate: string;
  minimumPurchase: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
};

type CouponForm = {
  code: string;
  discountType: "percentage" | "flat";
  value: string;
  minimumPurchase: string;
  usageLimit: string;
  expiryDate: string;
  active: boolean;
};

const defaultForm: CouponForm = {
  code: "",
  discountType: "percentage",
  value: "",
  minimumPurchase: "0",
  usageLimit: "100",
  expiryDate: datetimeLocalDaysFromNow(30),
  active: true
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/coupons");
      setCoupons(res.data?.coupons ?? []);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      total: coupons.length,
      active: coupons.filter((coupon) => coupon.active && !isExpired(coupon)).length,
      expired: coupons.filter((coupon) => !coupon.active || isExpired(coupon)).length,
      used: coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)
    }),
    [coupons]
  );

  function update(key: keyof CouponForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editCoupon(coupon: Coupon) {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      value: String(coupon.value),
      minimumPurchase: String(coupon.minimumPurchase),
      usageLimit: String(coupon.usageLimit),
      expiryDate: toDatetimeLocal(coupon.expiryDate),
      active: coupon.active
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        value: Number(form.value),
        minimumPurchase: Number(form.minimumPurchase || 0),
        usageLimit: Number(form.usageLimit || 1),
        expiryDate: form.expiryDate,
        active: form.active
      };
      const res = await api.post("/admin/coupons", payload);
      const saved = res.data?.coupon as Coupon;
      setCoupons((current) => {
        const exists = current.some((coupon) => coupon.id === saved.id);
        return exists ? current.map((coupon) => (coupon.id === saved.id ? saved : coupon)) : [saved, ...current];
      });
      setForm(defaultForm);
      toast.success("Coupon saved");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(coupon: Coupon) {
    setTogglingId(coupon.id);
    try {
      const res = await api.patch(`/admin/coupons/${coupon.id}/active`, { active: !coupon.active });
      const updated = res.data?.coupon as Coupon;
      setCoupons((current) => current.map((item) => (item.id === coupon.id ? updated : item)));
      toast.success(updated.active ? "Coupon activated" : "Coupon deactivated");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to update coupon");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Promotions</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Coupons</h2>
          <p className="mt-1 text-sm text-slate-500">Create controlled discount codes. Checkout validates every coupon again before charging.</p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total coupons" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Expired/inactive" value={stats.expired} danger={stats.expired > 0} />
        <Stat label="Total uses" value={stats.used} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Percent className="text-indigo-600" size={20} />
            <h3 className="text-lg font-black text-slate-950">Create or update coupon</h3>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Coupon code">
              <input value={form.code} onChange={(event) => update("code", event.target.value.toUpperCase())} placeholder="GRIM20" className={inputClass} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Discount type">
                <select value={form.discountType} onChange={(event) => update("discountType", event.target.value as CouponForm["discountType"])} className={inputClass}>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat amount</option>
                </select>
              </Field>
              <Field label={form.discountType === "percentage" ? "Discount %" : "Discount amount"}>
                <input type="number" min="1" max={form.discountType === "percentage" ? 100 : undefined} value={form.value} onChange={(event) => update("value", event.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum purchase">
                <input type="number" min="0" value={form.minimumPurchase} onChange={(event) => update("minimumPurchase", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Usage limit">
                <input type="number" min="1" value={form.usageLimit} onChange={(event) => update("usageLimit", event.target.value)} className={inputClass} />
              </Field>
            </div>

            <Field label="Expiry date">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <CalendarClock size={18} className="text-slate-400" />
                <input type="datetime-local" value={form.expiryDate} onChange={(event) => update("expiryDate", event.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none" />
              </div>
            </Field>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
              Active at checkout
              <input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} className="h-5 w-5 accent-indigo-600" />
            </label>
          </div>

          <button disabled={saving} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-sm hover:bg-red-700 disabled:opacity-60">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save coupon
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading && (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="mx-auto mb-2 animate-spin" /> Loading coupons
            </div>
          )}

          {!loading && coupons.length === 0 && <p className="py-12 text-center text-sm font-bold text-slate-500">No coupons created yet.</p>}

          {!loading && coupons.length > 0 && (
            <>
            <div className="grid gap-3 md:hidden">
              {coupons.map((coupon) => {
                const status = couponStatus(coupon);
                return (
                  <article key={coupon.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{coupon.code}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{coupon.discountType === "percentage" ? `${coupon.value}% off` : `${money(coupon.value)} off`}</p>
                      </div>
                      <Badge tone={status.tone} label={status.label} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <MobileCouponMetric label="Minimum" value={money(coupon.minimumPurchase)} />
                      <MobileCouponMetric label="Usage" value={`${coupon.usedCount} / ${coupon.usageLimit}`} />
                      <MobileCouponMetric label="Expiry" value={formatDateTime(coupon.expiryDate)} />
                      <MobileCouponMetric label="State" value={coupon.active ? "Active" : "Inactive"} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => editCoupon(coupon)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
                        Edit
                      </button>
                      <button
                        onClick={() => toggle(coupon)}
                        disabled={togglingId === coupon.id}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black disabled:opacity-60 ${coupon.active ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {togglingId === coupon.id ? <Loader2 size={14} className="animate-spin" /> : coupon.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        {coupon.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3">Code</th>
                    <th>Discount</th>
                    <th>Minimum</th>
                    <th>Usage</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const status = couponStatus(coupon);
                    return (
                      <tr key={coupon.id} className="border-t border-slate-100">
                        <td className="py-4">
                          <p className="font-black text-slate-950">{coupon.code}</p>
                        </td>
                        <td className="font-bold text-slate-700">{coupon.discountType === "percentage" ? `${coupon.value}% off` : `${money(coupon.value)} off`}</td>
                        <td className="font-bold text-slate-700">{money(coupon.minimumPurchase)}</td>
                        <td className="font-bold text-slate-700">{coupon.usedCount} / {coupon.usageLimit}</td>
                        <td className="font-bold text-slate-700">{formatDateTime(coupon.expiryDate)}</td>
                        <td><Badge tone={status.tone} label={status.label} /></td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => editCoupon(coupon)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                              Edit
                            </button>
                            <button
                              onClick={() => toggle(coupon)}
                              disabled={togglingId === coupon.id}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black disabled:opacity-60 ${coupon.active ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                            >
                              {togglingId === coupon.id ? <Loader2 size={14} className="animate-spin" /> : coupon.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                              {coupon.active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function MobileCouponMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 break-words text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}

const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
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

function Badge({ label, tone }: { label: string; tone: "green" | "red" | "slate" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[tone]}`}>{label}</span>;
}

function couponStatus(coupon: Coupon): { label: string; tone: "green" | "red" | "slate" } {
  if (!coupon.active) return { label: "Inactive", tone: "red" };
  if (isExpired(coupon)) return { label: "Expired", tone: "red" };
  if (coupon.usedCount >= coupon.usageLimit) return { label: "Limit reached", tone: "slate" };
  return { label: "Active", tone: "green" };
}

function isExpired(coupon: Coupon) {
  return new Date(coupon.expiryDate).getTime() <= Date.now();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return defaultForm.expiryDate;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function datetimeLocalDaysFromNow(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
