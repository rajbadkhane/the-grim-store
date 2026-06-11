"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Phone, User, Lock, KeyRound, Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

type FormState = "signin-password" | "signin-otp" | "signup" | "forgot-password" | "reset-password";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status, refreshMe } = useAuth();
  
  const [mode, setMode] = useState<FormState>("signin-password");
  
  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" || user) {
      const redirect = searchParams.get("redirect") || "/account";
      router.push(redirect);
    }
  }, [user, status, router, searchParams]);

  // Form Reset
  const switchMode = (nextMode: FormState) => {
    setMode(nextMode);
    setOtpSent(false);
    setOtpCode("");
    setPassword("");
  };

  // Google Login Simulation
  async function handleGoogleLogin() {
    setLoading(true);
    toast.loading("Opening Google Sign-In...", { id: "google-loading" });
    
    // Simulate minor social popup delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    try {
      const res = await api.post("/auth/google-login", {
        email: "raj.grimstore@gmail.com",
        name: "Raj Badkhane",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
      });

      if (res.data?.success) {
        toast.dismiss("google-loading");
        toast.success("Successfully logged in with Google!");
        await refreshMe();
        const redirect = searchParams.get("redirect") || "/account";
        router.push(redirect);
      } else {
        toast.dismiss("google-loading");
        toast.error("Google login failed. Try again.");
      }
    } catch (err: any) {
      toast.dismiss("google-loading");
      toast.error(err.response?.data?.message ?? "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Standard Login (Password)
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/password-login", {
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (res.data?.success) {
        toast.success("Welcome back to The Grim Store!");
        await refreshMe();
        const redirect = searchParams.get("redirect") || "/account";
        router.push(redirect);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Signup
  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill all the details.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim()
      });

      if (res.data?.success) {
        toast.success("Account registered successfully!");
        await refreshMe();
        router.push("/account");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  // Request OTP (for login or forgot-password)
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    
    if (mode === "signin-otp" && !otpSent && (!name.trim() || !phone.trim())) {
      toast.error("Name and Mobile are required for quick verification.");
      return;
    }

    setLoading(true);
    const purpose = mode === "forgot-password" ? "reset" : "login";
    try {
      const res = await api.post("/auth/request-otp", {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        purpose
      });

      if (res.data?.success) {
        toast.success("Verification code sent to your email!");
        setOtpSent(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP for Signin
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        code: otpCode.trim(),
        name: name.trim(),
        phone: phone.trim(),
        purpose: "login"
      });

      if (res.data?.success) {
        toast.success("Signed in successfully!");
        await refreshMe();
        const redirect = searchParams.get("redirect") || "/account";
        router.push(redirect);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Verification failed. Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Reset Password using OTP
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim() || password.trim().length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        code: otpCode.trim(),
        password: password.trim()
      });

      if (res.data?.success) {
        toast.success("Password reset complete. Please login.");
        switchMode("signin-password");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Password reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-electrox-elevated/80 bg-electrox-surface p-6 shadow-xl dark:shadow-2xl sm:p-10">
      
      {/* Glows in dark mode */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-purple-500/10 dark:bg-purple-500/15 blur-3xl" />

      {/* Branding header */}
      <div className="relative text-center">
        <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-electrox-elevated bg-electrox-bg-2 shadow-sm text-electrox-blue">
          <Cpu size={20} />
        </Link>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground uppercase">
          The Grim Store
        </h1>
        <p className="mt-1.5 text-xs font-semibold text-neutral-450">
          {mode === "signin-password" && "Welcome back! Login to your account."}
          {mode === "signin-otp" && "Verification code login / quick registration."}
          {mode === "signup" && "Create a secure account with us."}
          {mode === "forgot-password" && "Recover your account password."}
          {mode === "reset-password" && "Enter OTP and your new password."}
        </p>
      </div>

      <div className="relative mt-8">
        <AnimatePresence mode="wait">
          
          {/* 1. SIGN IN (PASSWORD) */}
          {mode === "signin-password" && (
            <motion.form
              key="signin-pass"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePasswordLogin}
              className="grid gap-4"
            >
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Email Address
                <div className="relative mt-2 flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                <div className="flex items-center justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="text-[10px] font-black text-electrox-blue hover:underline lowercase"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-2 flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg disabled:opacity-60 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? "Checking..." : "Sign In"}
              </button>
            </motion.form>
          )}

          {/* 2. SIGN IN (OTP) */}
          {mode === "signin-otp" && (
            <motion.form
              key="signin-otp"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
              className="grid gap-4"
            >
              {!otpSent ? (
                <>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                    Full Name
                    <div className="relative mt-2 flex items-center">
                      <User size={16} className="absolute left-3.5 text-neutral-450" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                      />
                    </div>
                  </label>

                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                    Mobile Number
                    <div className="relative mt-2 flex items-center">
                      <Phone size={16} className="absolute left-3.5 text-neutral-450" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit number"
                        className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                      />
                    </div>
                  </label>

                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                    Email Address
                    <div className="relative mt-2 flex items-center">
                      <Mail size={16} className="absolute left-3.5 text-neutral-450" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                      />
                    </div>
                  </label>
                </>
              ) : (
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                  6-Digit Verification Code
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="mt-2 w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 text-center text-xl font-black tracking-[0.4em] text-foreground outline-none focus:border-electrox-blue"
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg disabled:opacity-60 transition"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Processing..." : otpSent ? "Verify & Sign In" : "Send Verification Code"}
              </button>
            </motion.form>
          )}

          {/* 3. SIGN UP (CREATE ACCOUNT) */}
          {mode === "signup" && (
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignupSubmit}
              className="grid gap-4"
            >
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Full Name
                <div className="relative mt-2 flex items-center">
                  <User size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Mobile Number
                <div className="relative mt-2 flex items-center">
                  <Phone size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit number"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Email Address
                <div className="relative mt-2 flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Choose Password
                <div className="relative mt-2 flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg disabled:opacity-60 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={16} />}
                {loading ? "Creating..." : "Create Account"}
              </button>
            </motion.form>
          )}

          {/* 4. FORGOT PASSWORD */}
          {mode === "forgot-password" && (
            <motion.form
              key="forgot-pass"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSendOtp}
              className="grid gap-4"
            >
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Registered Email Address
                <div className="relative mt-2 flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg disabled:opacity-60 transition"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Request Reset OTP"}
              </button>
              
              {otpSent && (
                <button
                  type="button"
                  onClick={() => switchMode("reset-password")}
                  className="mt-2 text-center text-xs font-black text-electrox-blue hover:underline"
                >
                  Code already received? Click here to set password.
                </button>
              )}
            </motion.form>
          )}

          {/* 5. RESET PASSWORD */}
          {mode === "reset-password" && (
            <motion.form
              key="reset-pass"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleResetPassword}
              className="grid gap-4"
            >
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                Verification Code (Sent to email)
                <div className="relative mt-2 flex items-center">
                  <KeyRound size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450">
                New Password
                <div className="relative mt-2 flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-neutral-450" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-2xl border border-electrox-elevated bg-electrox-bg-2 py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:border-electrox-blue"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-lg disabled:opacity-60 transition"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Resetting..." : "Complete Password Reset"}
              </button>
            </motion.form>
          )}

        </AnimatePresence>
      </div>

      {/* Separator line */}
      <div className="relative my-6 flex items-center justify-center">
        <hr className="w-full border-electrox-elevated" />
        <span className="absolute bg-electrox-surface px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
          Or
        </span>
      </div>

      {/* Social Authentication Options */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-electrox-elevated bg-electrox-bg-2 px-6 text-xs font-black uppercase tracking-wider text-foreground hover:bg-electrox-elevated transition shadow-sm"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Auth mode switches */}
      <div className="mt-8 text-center text-xs font-semibold text-neutral-450">
        {mode === "signin-password" && (
          <p>
            Don't have an account?{" "}
            <button onClick={() => switchMode("signup")} className="font-extrabold text-electrox-blue hover:underline">
              Sign up
            </button>{" "}
            or{" "}
            <button onClick={() => switchMode("signin-otp")} className="font-extrabold text-electrox-blue hover:underline">
              Use OTP
            </button>
          </p>
        )}
        
        {mode === "signin-otp" && (
          <p>
            Already registered?{" "}
            <button onClick={() => switchMode("signin-password")} className="font-extrabold text-electrox-blue hover:underline">
              Use Password
            </button>{" "}
            or{" "}
            <button onClick={() => switchMode("signup")} className="font-extrabold text-electrox-blue hover:underline">
              Create Account
            </button>
          </p>
        )}

        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <button onClick={() => switchMode("signin-password")} className="font-extrabold text-electrox-blue hover:underline">
              Sign in
            </button>
          </p>
        )}

        {(mode === "forgot-password" || mode === "reset-password") && (
          <button
            onClick={() => switchMode("signin-password")}
            className="font-extrabold text-electrox-blue hover:underline"
          >
            Back to login page
          </button>
        )}
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12 transition-colors duration-300">
      <Suspense fallback={
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-electrox-elevated/80 bg-electrox-surface p-6 shadow-xl text-center py-20">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-electrox-blue" />
          <p className="mt-4 text-xs font-semibold text-neutral-450">Loading verification portal...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
