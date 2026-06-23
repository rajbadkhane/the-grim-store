"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin/login", { email, password });
      if (data.user?.role !== "admin") {
        await api.post("/auth/logout").catch(() => null);
        toast.error("Admin access required");
        return;
      }
      toast.success("Welcome back");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Invalid admin email or password");
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
            <p className="text-sm text-slate-500">Sign in with admin credentials</p>
          </div>
        </div>
        <form onSubmit={login}>
          <label className="text-sm font-bold text-slate-700">Admin email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            autoComplete="email"
            required
          />
          <label className="mt-5 block text-sm font-bold text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            autoComplete="current-password"
            required
          />
          <button type="submit" disabled={loading || !email || !password} className="mt-6 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
