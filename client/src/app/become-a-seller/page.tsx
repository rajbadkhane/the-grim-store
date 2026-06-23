"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

const fields = [
  ["businessName", "Business / Store Name", "Grim Gadgets"],
  ["ownerName", "Owner Name", "Your full name"],
  ["email", "Email Address", "seller@example.com"],
  ["phone", "Phone Number", "9876543210"],
  ["city", "City", "Delhi"],
  ["pincode", "Pincode", "110060"],
  ["category", "Main Product Category", "Electronics, fashion, accessories"],
  ["productCount", "Approx Product Count", "50+"],
  ["monthlySales", "Monthly Sales Range", "₹50,000 - ₹2,00,000"],
  ["gstNumber", "GST Number", "Optional"],
  ["website", "Website / Instagram", "Optional"]
] as const;

type FormState = Record<(typeof fields)[number][0] | "message", string>;

const initialForm = fields.reduce((acc, [key]) => ({ ...acc, [key]: "" }), { message: "" }) as FormState;

export default function BecomeSellerPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/seller-requests", form);
      setSubmitted(true);
      toast.success("Your request submitted");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to submit seller request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] px-4 py-10 text-[#111] dark:bg-[#080808] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#FF3B30]">
          <ArrowLeft size={15} /> Back to store
        </Link>

        <section className="mt-6 grid overflow-hidden rounded-md border border-[#e8d9d9] bg-white shadow-[0_24px_60px_rgba(80,24,24,0.10)] dark:border-white/10 dark:bg-[#101010] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-[#111] p-8 text-white lg:p-10">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#FF3B30]">Partner With Us</p>
            <h1 className="mt-4 font-heading text-4xl uppercase leading-none tracking-wide sm:text-5xl">Become A Seller</h1>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-white/70">
              Fill the details below. Our team will review your catalog, product quality, delivery capability, and contact you.
            </p>
            <div className="mt-8 grid gap-3 text-xs font-bold text-white/75">
              {["Business details", "Product category", "Contact information", "Admin review"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#FF3B30]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {submitted ? (
            <div className="grid min-h-[520px] place-items-center p-8 text-center">
              <div>
                <CheckCircle2 className="mx-auto text-[#FF3B30]" size={46} />
                <h2 className="mt-5 font-heading text-3xl uppercase tracking-wide">Your Request Submitted</h2>
                <p className="mx-auto mt-3 max-w-md text-sm font-semibold text-[#6b5656] dark:text-white/60">
                  We received your seller application. The admin team will review it and contact you soon.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2 lg:p-8">
              {fields.map(([key, label, placeholder]) => (
                <label key={key} className="text-xs font-black uppercase tracking-wide text-[#5f4a4a] dark:text-white/65">
                  {label}
                  <input
                    value={form[key]}
                    onChange={(event) => update(key, event.target.value)}
                    placeholder={placeholder}
                    className="mt-2 h-11 w-full rounded-none border border-[#e3d0d0] bg-white px-3 text-sm font-semibold normal-case tracking-normal text-[#111] outline-none focus:border-[#FF3B30] dark:border-white/10 dark:bg-black/25 dark:text-white"
                  />
                </label>
              ))}
              <label className="text-xs font-black uppercase tracking-wide text-[#5f4a4a] dark:text-white/65 sm:col-span-2">
                Product / Business Details
                <textarea
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  placeholder="Tell us what you sell, current marketplaces, logistics capability, and why your products fit The Grim Store."
                  className="mt-2 min-h-28 w-full rounded-none border border-[#e3d0d0] bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-[#111] outline-none focus:border-[#FF3B30] dark:border-white/10 dark:bg-black/25 dark:text-white"
                />
              </label>
              <button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 bg-[#E31B23] px-6 text-xs font-black uppercase tracking-wide text-white hover:bg-[#FF3B30] disabled:opacity-60 sm:col-span-2">
                <Send size={15} />
                {loading ? "Submitting..." : "Submit Seller Request"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
