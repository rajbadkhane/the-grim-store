"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Phone, User, Lock, KeyRound, Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { LightweightCanvas } from "@/components/layout/lightweight-canvas";

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
    <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-md">
      
      {/* Brand header banner gradient - matching premium Apple/Nintendo/Nothing vibes */}
      <div className="relative w-full aspect-[2.8/1] bg-gradient-to-tr from-[#FF6B35] to-[#FFD93D] overflow-hidden flex items-center justify-center p-6 select-none border-b border-neutral-200/55 dark:border-neutral-800/60">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative text-center">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-neutral-950 uppercase tracking-widest leading-none">THE GRIM STORE</h2>
          <p className="mt-1 text-[9px] font-heading font-black text-neutral-950/80 uppercase tracking-wider">Play • Learn • Explore</p>
        </div>
      </div>

      <div className="p-6 sm:p-8 flex flex-col gap-6">
        {/* Branding header info */}
        <div className="relative">
          <h1 className="text-base font-heading font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-baseline gap-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            {mode === "signin-password" && (
              <>
                Login <span className="text-[10px] font-normal text-neutral-600 dark:text-neutral-400 lowercase">or</span> Signin
              </>
            )}
            {mode === "signin-otp" && (
              <>
                OTP Login <span className="text-[10px] font-normal text-neutral-600 dark:text-neutral-400 lowercase">or</span> Signup
              </>
            )}
            {mode === "signup" && "Create Account"}
            {mode === "forgot-password" && "Reset Password"}
            {mode === "reset-password" && "Verify & Set"}
          </h1>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-350 font-medium">
            {mode === "signin-password" && "Enter your email and password to log in."}
            {mode === "signin-otp" && "Verification code login / quick registration."}
            {mode === "signup" && "Join The Grim Store for custom tech and style."}
            {mode === "forgot-password" && "Recover your account password."}
            {mode === "reset-password" && "Enter the 6-digit code and set your password."}
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* 1. SIGN IN (PASSWORD) */}
            {mode === "signin-password" && (
              <motion.div
                key="signin-pass"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form
                  onSubmit={handlePasswordLogin}
                  className="grid gap-4"
                >
                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot-password")}
                      className="text-[10px] font-heading font-extrabold text-[#FF6B35] hover:underline uppercase tracking-wider transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {loading ? "Checking..." : "Login"}
                </button>
                </form>
              </motion.div>
            )}

            {/* 2. SIGN IN (OTP) */}
            {mode === "signin-otp" && (
              <motion.div
                key="signin-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                  className="grid gap-4"
                >
                {!otpSent ? (
                  <>
                    <div className="grid gap-1">
                      <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid gap-1">
                    <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350 text-center">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 text-center text-xl font-extrabold tracking-[0.3em] text-[#424553] dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] transition-all placeholder:text-neutral-400"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Processing..." : otpSent ? "Verify & Log In" : "Send Verification Code"}
                </button>
                </form>
              </motion.div>
            )}

            {/* 3. SIGN UP (CREATE ACCOUNT) */}
            {mode === "signup" && (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form
                  onSubmit={handleSignupSubmit}
                  className="grid gap-4"
                >
                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit number"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Choose Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                  {loading ? "Creating..." : "Create Account"}
                </button>
                </form>
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD */}
            {mode === "forgot-password" && (
              <motion.div
                key="forgot-pass"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form
                  onSubmit={handleSendOtp}
                  className="grid gap-4"
                >
                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Sending..." : "Request Reset OTP"}
                </button>
                
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => switchMode("reset-password")}
                    className="mt-2 text-center text-xs font-heading font-extrabold text-[#FF6B35] hover:underline uppercase tracking-wider"
                  >
                    Code already received? Click here to set password.
                  </button>
                )}
                </form>
              </motion.div>
            )}

            {/* 5. RESET PASSWORD */}
            {mode === "reset-password" && (
              <motion.div
                key="reset-pass"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form
                  onSubmit={handleResetPassword}
                  className="grid gap-4"
                >
                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    Verification Code (Sent to email)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-[9.5px] font-heading font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-350">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Resetting..." : "Complete Password Reset"}
                </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Separator line */}
        <div className="relative flex items-center justify-center">
          <hr className="w-full border-neutral-200 dark:border-neutral-800" />
          <span className="absolute bg-white dark:bg-[#151B26] px-3 text-[9px] font-heading font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Or
          </span>
        </div>

        {/* Social Authentication Options */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex min-h-[44px] w-full items-center justify-center gap-3 rounded-xl border border-neutral-250 dark:border-neutral-850 bg-white dark:bg-neutral-900/30 px-6 text-xs font-heading font-extrabold uppercase tracking-widest text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="flex-shrink-0">
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
        <div className="text-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          {mode === "signin-password" && (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-heading font-black text-[#FF6B35] hover:underline uppercase tracking-wider"
              >
                Sign up
              </button>{" "}
              or{" "}
              <button
                onClick={() => switchMode("signin-otp")}
                className="font-heading font-black text-[#FF6B35] hover:underline uppercase tracking-wider"
              >
                Use OTP
              </button>
            </p>
          )}
          
          {mode === "signin-otp" && (
            <p>
              Already registered?{" "}
              <button
                onClick={() => switchMode("signin-password")}
                className="font-heading font-black text-[#FF6B35] hover:underline uppercase tracking-wider"
              >
                Use Password
              </button>{" "}
              or{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-heading font-black text-[#FF6B35] hover:underline uppercase tracking-wider"
              >
                Create Account
              </button>
            </p>
          )}

          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => switchMode("signin-password")}
                className="font-heading font-black text-[#FF6B35] hover:underline uppercase tracking-wider"
              >
                Sign in
              </button>
            </p>
          )}

          {(mode === "forgot-password" || mode === "reset-password") && (
            <button
              onClick={() => switchMode("signin-password")}
              className="font-heading font-black text-[#FF6B35] hover:underline uppercase tracking-wider"
            >
              Back to login page
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden mobile-bottom-safe flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-transparent px-4 py-12 transition-colors duration-300">
      <LightweightCanvas />
      <Suspense fallback={
        <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl store-shell p-6 text-center py-20 animate-pulse">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#FF6B35]" />
          <p className="mt-4 text-xs font-semibold text-neutral-600 dark:text-neutral-350">Loading verification portal...</p>
        </div>
      }>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          <LoginForm />
        </motion.div>
      </Suspense>
    </div>
  );
}

