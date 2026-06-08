"use client";

import { useState } from "react";
import { Loader2, Mail, Phone, User, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export function LoginModal() {
  const { showLoginModal, closeLoginModal, refreshMe } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!showLoginModal) return null;

  async function handleSendCode(event: React.FormEvent) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Please enter your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/request-otp", {
        email: trimmedEmail,
        purpose: "login"
      });

      if (res.data?.success) {
        setEmail(trimmedEmail);
        setPhone(trimmedPhone);
        setName(trimmedName);
        toast.success("Code sent to your email.");
        setStep(2);
      } else {
        toast.error("Could not send code. Try again.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Could not send code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent) {
    event.preventDefault();
    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      toast.error("Enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email,
        code: trimmedCode,
        purpose: "login",
        name,
        phone
      });

      if (res.data?.success) {
        toast.success("Signed in.");
        await refreshMe();
        handleClose();
      } else {
        toast.error("Invalid code.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resending) return;
    setResending(true);
    try {
      const res = await api.post("/auth/request-otp", {
        email,
        purpose: "login"
      });
      if (res.data?.success) toast.success("Code sent.");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Could not resend code.");
    } finally {
      setResending(false);
    }
  }

  function handleClose() {
    setStep(1);
    setCode("");
    closeLoginModal();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 px-4 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-red-500/20 bg-[#0d0d0d] p-7 shadow-[0_24px_80px_rgba(225,29,46,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white">{step === 1 ? "Sign in" : "Enter code"}</h2>
            <p className="mt-1 text-xs font-bold text-white/50">
              {step === 1 ? "We will email a 6-digit code." : `Sent to ${email}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="mt-5 grid gap-4">
            <label className="text-xs font-black uppercase tracking-wider text-white/60">
              Name
              <div className="relative mt-2 flex items-center">
                <User size={16} className="absolute left-3.5 text-white/40" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-md border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-red-500 focus:bg-black"
                />
              </div>
            </label>

            <label className="text-xs font-black uppercase tracking-wider text-white/60">
              Mobile
              <div className="relative mt-2 flex items-center">
                <Phone size={16} className="absolute left-3.5 text-white/40" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit number"
                  className="w-full rounded-md border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-red-500 focus:bg-black"
                />
              </div>
            </label>

            <label className="text-xs font-black uppercase tracking-wider text-white/60">
              Email
              <div className="relative mt-2 flex items-center">
                <Mail size={16} className="absolute left-3.5 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-red-500 focus:bg-black"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-red-600 py-3.5 text-sm font-black text-white transition hover:bg-red-500 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending..." : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="mt-5 grid gap-4">
            <label className="text-xs font-black uppercase tracking-wider text-white/60">
              6-digit code
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="mt-2 w-full rounded-md border border-white/10 bg-black/50 py-3.5 text-center text-xl font-black tracking-[0.4em] text-white outline-none transition placeholder:text-white/20 focus:border-red-500 focus:bg-black"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-red-600 py-3.5 text-sm font-black text-white transition hover:bg-red-500 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Checking..." : "Sign in"}
            </button>

            <div className="mt-2 flex items-center justify-between text-xs font-bold">
              <button type="button" onClick={() => setStep(1)} className="text-white/40 transition hover:text-white">
                Edit details
              </button>
              <button
                type="button"
                disabled={resending}
                onClick={handleResendCode}
                className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
