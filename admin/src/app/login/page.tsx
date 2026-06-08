"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("badkhaneraj@gmail.com");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/request-otp", { email, purpose: "login" });
      setDevOtp(data.devOtp ?? "");
      toast.success("OTP sent");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, code: otp, purpose: "login" });
      if (data.user?.role !== "admin") {
        toast.error("Admin access required");
        return;
      }
      toast.success("Welcome back");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f6fb] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-xl font-black text-white">G</span>
          <div>
            <h1 className="text-2xl font-black text-slate-950">GrimAdmin</h1>
            <p className="text-sm text-slate-500">Sign in with email OTP</p>
          </div>
        </div>
        <label className="text-sm font-bold text-slate-700">Admin email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900" />
        <button onClick={sendOtp} disabled={loading} className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60">
          Send OTP
        </button>
        {devOtp && <p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">Dev OTP: {devOtp}</p>}
        <label className="mt-5 block text-sm font-bold text-slate-700">OTP</label>
        <input value={otp} onChange={(event) => setOtp(event.target.value)} maxLength={6} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900" placeholder="6 digit code" />
        <button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">
          Login
        </button>
      </div>
    </div>
  );
}
