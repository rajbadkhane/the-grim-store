"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
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
  const { user, status, refreshMe, setAuthenticatedUser } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleInitializedRef = useRef(false);
  const redirectingRef = useRef(false);
  
  const [mode, setMode] = useState<FormState>("signin-password");
  
  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const getRedirectPath = useCallback(() => {
    const redirect = searchParams.get("redirect") || "/account";
    return redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account";
  }, [searchParams]);

  const navigateAfterAuth = useCallback(() => {
    const redirectPath = getRedirectPath();
    if (redirectingRef.current) return;

    redirectingRef.current = true;
    router.replace(redirectPath);
    router.refresh();

    window.setTimeout(() => {
      if (window.location.pathname === "/login") {
        window.location.replace(redirectPath);
      }
    }, 350);
  }, [getRedirectPath, router]);

  const completeAuthSuccess = useCallback(async (authUser: any, message: string) => {
    toast.success(message);
    if (authUser) {
      setAuthenticatedUser(authUser);
    } else {
      await refreshMe();
    }
    navigateAfterAuth();
  }, [navigateAfterAuth, refreshMe, setAuthenticatedUser]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" || user) {
      navigateAfterAuth();
    }
  }, [user, status, navigateAfterAuth]);

  useEffect(() => {
    let cancelled = false;

    async function confirmExistingSession() {
      if (redirectingRef.current || status === "authenticated" || user) return;

      try {
        const res = await api.get("/auth/me");
        const authUser = res.data?.user;
        if (!cancelled && authUser) {
          setAuthenticatedUser(authUser);
          navigateAfterAuth();
        }
      } catch {
        // No active session; keep the user on the login form.
      }
    }

    confirmExistingSession();
    return () => {
      cancelled = true;
    };
  }, [navigateAfterAuth, setAuthenticatedUser, status, user]);

  // Form Reset
  const switchMode = (nextMode: FormState) => {
    setMode(nextMode);
    setOtpSent(false);
    setOtpCode("");
    setPassword("");
  };

  const handleGoogleCredential = useCallback(async (response: any) => {
    if (!response?.credential) {
      toast.error("No Google credential received.");
      return;
    }

    setGoogleLoading(true);
    try {
      toast.loading("Authenticating with Google...", { id: "google-loading" });
      const res = await api.post("/auth/google-login", { idToken: response.credential });

      if (res.data?.success) {
        toast.dismiss("google-loading");
        await completeAuthSuccess(res.data.user, "Successfully logged in with Google!");
      } else {
        toast.dismiss("google-loading");
        toast.error("Google login failed. Try again.");
      }
    } catch (err: any) {
      toast.dismiss("google-loading");
      toast.error(err.response?.data?.message ?? err.message ?? "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  }, [completeAuthSuccess]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || googleInitializedRef.current) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const gsi = (window as any).google?.accounts?.id;
      if (!gsi || !googleButtonRef.current) {
        if (attempts > 80) window.clearInterval(timer);
        return;
      }

      const ua = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
      const useRedirect = isIOS || isSafari;

      googleInitializedRef.current = true;
      googleButtonRef.current.innerHTML = "";
      gsi.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        ux_mode: useRedirect ? "redirect" : "popup",
        login_uri: `${window.location.origin}/api/v1/auth/google-redirect`,
        state: getRedirectPath(),
        itp_support: true
      });
      gsi.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: Math.min(360, Math.max(280, googleButtonRef.current.clientWidth || 320))
      });
      window.clearInterval(timer);
    }, 150);

    return () => window.clearInterval(timer);
  }, [getRedirectPath, handleGoogleCredential]);

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
        await completeAuthSuccess(res.data.user, "Welcome back to The Grim Store!");
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
        await completeAuthSuccess(res.data.user, "Account registered successfully!");
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
        await completeAuthSuccess(res.data.user, "Signed in successfully!");
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
      
      <div className="relative flex aspect-[2.8/1] w-full items-center justify-center overflow-hidden border-b border-[#e5bdb8] bg-white p-6 select-none dark:border-[#3a1f1f] dark:bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(215,25,32,0.10),transparent_45%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,59,48,0.18),transparent_45%)]" />
        <div className="relative flex items-center gap-3">
          <span className="relative h-16 w-16 overflow-visible sm:h-20 sm:w-20">
            <img src="/logo.png" alt="" className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.22)]" aria-hidden="true" />
          </span>
          <div>
            <h2 className="grim-wordmark grim-wordmark-inline text-[26px] text-[#0A0A0A] dark:text-white sm:text-[32px]" aria-label="The Grim Store">
              <span className="grim-wordmark-kicker">The</span>
              <span>Grim</span>
              <span>Store</span>
            </h2>
            <p className="mt-1 text-[9px] font-heading font-black uppercase tracking-wider text-[#D71920]">Electronic items &amp; useful gadgets</p>
          </div>
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
            {mode === "signup" && "Join The Grim Store for saved addresses, wishlist, and faster checkout."}
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                      className="text-[10px] font-heading font-extrabold text-[var(--accent)] hover:underline uppercase tracking-wider transition-colors"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
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
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 text-center text-xl font-extrabold tracking-[0.3em] text-[#424553] dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] transition-all placeholder:text-neutral-400"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Sending..." : "Request Reset OTP"}
                </button>
                
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => switchMode("reset-password")}
                    className="mt-2 text-center text-xs font-heading font-extrabold text-[var(--accent)] hover:underline uppercase tracking-wider"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 px-4 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[var(--accent)] dark:focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] dark:bg-white hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] text-white dark:text-[#111827] dark:hover:text-white text-xs font-heading font-extrabold uppercase tracking-widest transition-all duration-205 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
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
        <div className="relative flex min-h-[44px] w-full items-center justify-center rounded-xl border border-neutral-250 bg-white px-2 py-1 dark:border-neutral-850 dark:bg-neutral-900/30">
          {googleLoading && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/90 text-xs font-heading font-extrabold uppercase tracking-widest text-neutral-900 dark:bg-neutral-900/90 dark:text-white">
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Connecting Google...</span>
            </div>
          )}
          <div ref={googleButtonRef} className="flex min-h-[40px] w-full justify-center" />
          {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <p className="py-2 text-center text-xs font-bold text-red-600">Google Client ID is not configured.</p>
          )}
        </div>

        {/* Auth mode switches */}
        <div className="text-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          {mode === "signin-password" && (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-heading font-black text-[var(--accent)] hover:underline uppercase tracking-wider"
              >
                Sign up
              </button>{" "}
              or{" "}
              <button
                onClick={() => switchMode("signin-otp")}
                className="font-heading font-black text-[var(--accent)] hover:underline uppercase tracking-wider"
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
                className="font-heading font-black text-[var(--accent)] hover:underline uppercase tracking-wider"
              >
                Use Password
              </button>{" "}
              or{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-heading font-black text-[var(--accent)] hover:underline uppercase tracking-wider"
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
                className="font-heading font-black text-[var(--accent)] hover:underline uppercase tracking-wider"
              >
                Sign in
              </button>
            </p>
          )}

          {(mode === "forgot-password" || mode === "reset-password") && (
            <button
              onClick={() => switchMode("signin-password")}
              className="font-heading font-black text-[var(--accent)] hover:underline uppercase tracking-wider"
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
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />
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
