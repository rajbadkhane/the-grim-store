"use client";

import { Banknote, CheckCircle2, CreditCard, Landmark, LocateFixed, Loader2, PartyPopper, Shield, Smartphone, Tag, Wallet, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

type AddressForm = {
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  house: string;
  road: string;
  landmark: string;
  latitude?: number;
  longitude?: number;

  // these match backend address shape best-effort
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
};

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  pincode: "",
  state: "",
  city: "",
  house: "",
  road: "",
  landmark: ""
};

const fields: Array<{ key: keyof AddressForm; label: string }> = [
  { key: "fullName", label: "Full name" },
  { key: "phone", label: "Phone" },
  { key: "pincode", label: "Pincode" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "house", label: "House / Flat" },
  { key: "road", label: "Road / Area" },
  { key: "landmark", label: "Landmark" }
];

type PaymentMethod = "cod" | "razorpay";
type PaymentChannel = "cod" | "upi" | "card" | "netbanking" | "wallet";

type PaymentOption = {
  id: PaymentChannel;
  method: PaymentMethod;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  details: string[];
  disabled?: boolean;
  disabledReason?: string;
};

type CouponQuote = {
  code: string;
  discountType: "percentage" | "flat";
  value: number;
  discountAmount: number;
  totalAmount: number;
};

type SavedAddress = {
  id: string;
  fullName?: string;
  phone?: string;
  pincode?: string;
  state?: string;
  city?: string;
  house?: string;
  road?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const cartItems = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clear);
  const router = useRouter();

  const [items, setItems] = useState<any[]>(cartItems);
  const [isDirectBuyNow, setIsDirectBuyNow] = useState(false);
  const codLimit = 5000;

  useEffect(() => {
    const intentStr = sessionStorage.getItem("grim_checkout_intent");
    if (intentStr) {
      try {
        const intent = JSON.parse(intentStr);
        const age = Date.now() - new Date(intent.createdAt).getTime();
        if (intent.isDirect && intent.item && age < 10 * 60 * 1000) {
          setItems([intent.item]);
          setIsDirectBuyNow(true);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setItems(cartItems);
    setIsDirectBuyNow(false);
  }, [cartItems]);

  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [detecting, setDetecting] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>("upi");
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; total: number } | null>(null);
  const [showSandboxModal, setShowSandboxModal] = useState<{ orderId: string; total: number; razorpayOrderId: string } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponQuote, setCouponQuote] = useState<CouponQuote | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const { refreshMe, openLoginModal } = useAuth();

  // saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0), [items]);
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 79;
  const discount = couponQuote?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const paymentOptions = useMemo<PaymentOption[]>(
    () => [
      {
        id: "upi",
        method: "razorpay",
        title: "UPI",
        subtitle: "Google Pay, PhonePe, Paytm, BHIM",
        description: "Pay instantly with any UPI app through secure Razorpay checkout.",
        icon: Smartphone,
        badge: "Recommended",
        details: ["Instant confirmation after payment", "No card details required", "Order ships after payment is verified"]
      },
      {
        id: "card",
        method: "razorpay",
        title: "Credit / Debit Card",
        subtitle: "Visa, Mastercard, RuPay and more",
        description: "Use a card safely through the payment gateway. We never store card details.",
        icon: CreditCard,
        details: ["Protected by Razorpay", "Payment status is verified before dispatch", "Refunds return to the original payment method"]
      },
      {
        id: "netbanking",
        method: "razorpay",
        title: "Net Banking",
        subtitle: "Pay directly from your bank",
        description: "Choose your bank inside Razorpay and complete payment securely.",
        icon: Landmark,
        details: ["Works with supported Indian banks", "Order is confirmed after bank success response", "Failed payments do not clear your cart"]
      },
      {
        id: "wallet",
        method: "razorpay",
        title: "Wallets",
        subtitle: "Supported wallets inside Razorpay",
        description: "Use available wallet options from the secure Razorpay checkout screen.",
        icon: Wallet,
        details: ["No internal store wallet balance required", "Payment is treated as prepaid", "Gateway confirmation is required"]
      },
      {
        id: "cod",
        method: "cod",
        title: "Cash on Delivery",
        subtitle: "Pay when the order arrives",
        description: "Place the order now and pay the courier at delivery.",
        icon: Banknote,
        details: ["Keep exact cash or UPI ready at delivery", "COD orders are verified before dispatch", "Available for orders up to Rs. 5,000"],
        disabled: total > codLimit,
        disabledReason: "COD is available up to Rs. 5,000."
      }
    ],
    [total, codLimit]
  );
  const selectedPaymentOption = paymentOptions.find((option) => option.id === paymentChannel && !option.disabled) ?? paymentOptions[0];
  const SelectedPaymentIcon = selectedPaymentOption.icon;
  const paymentMethod = selectedPaymentOption.method;

  useEffect(() => {
    const currentOption = paymentOptions.find((option) => option.id === paymentChannel);
    if (currentOption?.disabled) {
      setPaymentChannel("upi");
    }
  }, [paymentChannel, paymentOptions]);

  function updateAddress(key: keyof AddressForm, value: string) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  async function detect() {
    if (!("geolocation" in navigator)) {
      toast.error("Location is not supported in this browser");
      return;
    }
    if (detecting) return;

    setDetecting(true);

    const getPosition = () =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      });

    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      // Always store coordinates immediately
      setAddress((current) => ({
        ...current,
        latitude,
        longitude
      }));

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { cache: "no-store", signal: controller.signal }
        );

        if (!response.ok) throw new Error("Reverse geocoding failed");
        const data: any = await response.json();

        const pincode = data.postcode ?? data.postalCode ?? "";
        const state = data.principalSubdivision ?? data.state ?? "";
        const city = data.city ?? data.locality ?? data.localityInfo?.administrative?.[2]?.name ?? data.localityInfo?.administrative?.[1]?.name ?? "";

        const roadParts = [data.streets?.[0], data.locality, data.principalSubdivision, data.city, data.region].filter(
          (part: unknown) => typeof part === "string" && part.trim().length > 0
        ) as string[];

        const road = roadParts.length ? roadParts.join(", ") : "";
        const landmark = data.locality ?? "";

        setAddress((current) => ({
          ...current,
          latitude,
          longitude,
          pincode: pincode || current.pincode,
          state: state || current.state,
          city: city || current.city,
          road: road || current.road,
          landmark: landmark || current.landmark
        }));

        toast.success("Location detected and address filled");
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (error: any) {
      const message =
        error?.code === error.PERMISSION_DENIED
          ? "Location permission denied. Allow location access in the browser."
          : error?.code === error.POSITION_UNAVAILABLE
            ? "Location unavailable. Check GPS or network."
            : error?.name === "AbortError"
              ? "Location lookup timed out. Try again."
              : "Location found, but address lookup failed. Fill details manually.";

      toast.error(message);
    } finally {
      setDetecting(false);
    }
  }

  async function handleSandboxSuccess(paymentId: string, signature: string) {
    if (!showSandboxModal) return;
    setPlacing(true);
    const orderId = showSandboxModal.orderId;
    const total = showSandboxModal.total;
    const rzpOrderId = showSandboxModal.razorpayOrderId;
    setShowSandboxModal(null);
    try {
      const verifyRes = await api.post("/orders/verify-payment", {
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature
      });
      if (verifyRes.data?.success) {
        setOrderSuccess({ orderId, total });
        if (!isDirectBuyNow) {
          clearCart();
        }
        sessionStorage.removeItem("grim_checkout_intent");
        window.setTimeout(() => {
          router.push("/account?tab=orders");
        }, 5000);
      } else {
        toast.error("Payment verification failed.");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Payment verification failed.");
    } finally {
      setPlacing(false);
    }
  }

  async function placeOrder() {
    if (!items.length) return;
    if (!isAuthed) {
      toast.error("Login required to checkout.");
      router.push("/account");
      return;
    }
    if (placing) return;

    const payload: any = {
      paymentMethod,
      paymentChannel: selectedPaymentOption.id,
      paymentLabel: selectedPaymentOption.title,
      products: items
    };
    if (couponQuote?.code) payload.couponCode = couponQuote.code;
    if (isDirectBuyNow) payload.isDirectBuyNow = true;

    if (useNewAddress) {
      if (!address.fullName || !address.phone || !address.pincode || !address.state || !address.city || !address.house || !address.road) {
        toast.error("Please fill the full shipping address before placing the order.");
        return;
      }
      payload.shippingAddress = address;
    } else {
      if (!selectedAddressId) {
        toast.error("Please select a shipping address.");
        return;
      }
      payload.addressId = selectedAddressId;
    }

    setPlacing(true);
    try {
      const res = await api.post("/orders/checkout", payload);

      if (res.data?.success) {
        const order = res.data.order;
        const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? res.data.razorpayKeyId;

        if (paymentMethod === "razorpay") {
          const razorpayOrderId = order.paymentInfo?.razorpayOrderId;
          if (!razorpayOrderId) {
            toast.error("Failed to generate payment gateway order.");
            setPlacing(false);
            return;
          }

          if (!rzpKeyId) {
            toast.error("Razorpay public key is not configured.");
            setPlacing(false);
            return;
          }

          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            toast.error("Failed to load Razorpay SDK. Check your connection.");
            setPlacing(false);
            return;
          }

          const options = {
            key: rzpKeyId,
            amount: Number(order.paymentInfo?.razorpayAmount ?? Math.round(Number(order.totalAmount) * 100)),
            currency: order.paymentInfo?.razorpayCurrency ?? "INR",
            name: "The Grim Store",
            description: `${selectedPaymentOption.title} payment for ${order.orderId}`,
            order_id: razorpayOrderId,
            notes: {
              paymentChannel: selectedPaymentOption.id,
              orderId: order.orderId
            },
            handler: async function (response: any) {
              setPlacing(true);
              try {
                const verifyRes = await api.post("/orders/verify-payment", {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
                if (verifyRes.data?.success) {
                  setOrderSuccess({ orderId: order.orderId, total: Number(order.totalAmount) });
                  if (!isDirectBuyNow) {
                    clearCart();
                  }
                  sessionStorage.removeItem("grim_checkout_intent");
                  window.setTimeout(() => {
                    router.push("/account?tab=orders");
                  }, 5000);
                } else {
                  toast.error("Payment verification failed.");
                }
              } catch (e: any) {
                toast.error(e.response?.data?.message ?? "Payment verification failed.");
              } finally {
                setPlacing(false);
              }
            },
            prefill: {
              name: useNewAddress ? address.fullName : savedAddresses.find((a) => a.id === selectedAddressId)?.fullName ?? "",
              contact: useNewAddress ? address.phone : savedAddresses.find((a) => a.id === selectedAddressId)?.phone ?? ""
            },
            theme: {
              color: "#ef4444"
            },
            modal: {
              ondismiss: function () {
                toast.error("Payment cancelled by user.");
                setPlacing(false);
              }
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            const description = response?.error?.description ?? "Payment failed. Please try again.";
            toast.error(description);
            setPlacing(false);
          });
          rzp.open();
          return;
        }

        setOrderSuccess({ orderId: order?.orderId ?? "Confirmed", total: Number(order?.totalAmount ?? total) });
        if (!isDirectBuyNow) {
          clearCart();
        }
        sessionStorage.removeItem("grim_checkout_intent");
        window.setTimeout(() => {
          router.push("/account?tab=orders");
        }, 5000);
      } else {
        toast.error("Order failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Checkout failed. Please try again.");
    } finally {
      if (paymentMethod !== "razorpay") {
        setPlacing(false);
      }
    }
  }

  async function applyCoupon(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code");
      toast.error("Enter a coupon code");
      return;
    }
    if (applyingCoupon) return;

    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await api.post("/orders/apply-coupon", {
        couponCode: couponCode.trim().toUpperCase(),
        products: items
      });
      const coupon = res.data?.coupon;
      setCouponQuote({
        code: coupon?.code ?? couponCode.trim().toUpperCase(),
        discountType: coupon?.discountType ?? "flat",
        value: Number(coupon?.value ?? 0),
        discountAmount: Number(res.data?.discountAmount ?? 0),
        totalAmount: Number(res.data?.totalAmount ?? subtotal + shipping)
      });
      setCouponCode(coupon?.code ?? couponCode.trim().toUpperCase());
      toast.success("Coupon applied");
    } catch (error: any) {
      const message = error.response?.data?.message ?? "Coupon could not be applied";
      setCouponQuote(null);
      setCouponError(message);
      toast.error(message);
    } finally {
      setApplyingCoupon(false);
    }
  }

  // Auth gating
  useEffect(() => {
    if (!items.length) {
      setCheckingAuth(false);
      setIsAuthed(false);
      return;
    }

    let cancelled = false;

    async function checkAuth() {
      setCheckingAuth(true);
      try {
        await refreshMe();
        const res = await api.get("/auth/me");
        if (cancelled) return;

        const authed = Boolean(res.data?.user);
        setIsAuthed(authed);

        if (!authed) {
          toast.error("Please login to checkout.");
          openLoginModal();
        }
      } catch {
        if (cancelled) return;

        setIsAuthed(false);
        toast.error("Please login to checkout.");
        openLoginModal();
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, router, refreshMe]);

  // Load saved addresses
  useEffect(() => {
    if (!items.length || !isAuthed) return;

    let cancelled = false;
    async function load() {
      setAddressesLoading(true);
      try {
        const res = await api.get("/users/addresses");
        if (cancelled) return;

        const addresses = (res.data?.addresses ?? []) as SavedAddress[];
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
          setSelectedAddressId(defaultAddress.id);
          setUseNewAddress(false);
        } else {
          setSelectedAddressId(null);
          setUseNewAddress(true);
        }
      } catch {
        if (cancelled) return;
        setSavedAddresses([]);
        setSelectedAddressId(null);
        setUseNewAddress(true);
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [items.length, isAuthed]);

  // If user is in "saved address" mode but addresses are missing, fall back to new address form.
  useEffect(() => {
    if (!isAuthed) return;
    if (useNewAddress) return;
    if (!savedAddresses.length) setUseNewAddress(true);
    if (savedAddresses.length && (!selectedAddressId || !savedAddresses.some((a) => a.id === selectedAddressId))) {
      const fallback = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
      setSelectedAddressId(fallback?.id ?? null);
    }
  }, [isAuthed, useNewAddress, savedAddresses, selectedAddressId]);

  // If cart becomes empty, reset address UI
  useEffect(() => {
    if (!items.length) {
      setSavedAddresses([]);
      setSelectedAddressId(null);
      setUseNewAddress(true);
      setAddress(emptyAddress);
      setCouponCode("");
      setCouponQuote(null);
      setCouponError("");
    }
  }, [items.length]);

  useEffect(() => {
    setCouponQuote(null);
    setCouponError("");
  }, [subtotal, shipping]);

  if (orderSuccess) {
    return <OrderSuccessPopup orderId={orderSuccess.orderId} total={orderSuccess.total} />;
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-white">
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-3xl font-black text-white">Your cart is empty</h1>
          <p className="mt-3 text-sm text-slate-400">Add items before checking out.</p>
          <Link href="/products" className="mt-6 inline-block">
            <Button variant="primary" className="px-6 font-black uppercase text-xs tracking-wider">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <h1 className="text-xl font-bold">Checking authentication...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-white">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-3xl font-black text-white">Login Required</h1>
          <p className="mt-3 text-sm text-slate-400">Please authenticate to access shipping details and complete your checkout.</p>
          <Button
            onClick={openLoginModal}
            className="mt-6 font-black px-8 uppercase tracking-wider text-xs shadow-lg"
          >
            Log In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">Secure checkout</p>
            <h1 className="electrox-gradient-text mt-2 text-3xl font-black tracking-tight sm:text-5xl">Checkout</h1>
          </div>
          <p className="text-sm text-slate-400">Big choices. Fast validation. Direct dispatch.</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="grid gap-6">
            {/* 1. SHIPPING ADDRESS SECTION CARD */}
            <div className="electrox-card rounded-[1.5rem] p-5">
              <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-black text-white">Shipping Address</h2>

                <div className="flex gap-2">
                  {!useNewAddress && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2 text-xs font-black text-white transition hover:border-blue-300/60 hover:bg-blue-500/10"
                      onClick={() => setUseNewAddress(true)}
                    >
                      Add new address
                    </button>
                  )}
                  {useNewAddress && (
                    <button
                      type="button"
                      className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2 text-xs font-black text-white transition hover:border-blue-300/60 hover:bg-blue-500/10"
                      onClick={() => {
                        if (savedAddresses.length > 0) {
                          const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
                          setSelectedAddressId(defaultAddress.id);
                          setUseNewAddress(false);
                        }
                      }}
                      disabled={savedAddresses.length === 0}
                    >
                      Use saved address
                    </button>
                  )}
                </div>
              </div>

              {addressesLoading && (
                <div className="flex items-center gap-2 mt-3 text-xs font-bold text-neutral-500 dark:text-white/60">
                  <Loader2 className="animate-spin text-blue-500" size={14} />
                  <span>Loading saved addresses...</span>
                </div>
              )}

              {/* Saved Address Radio Picker */}
              {!useNewAddress && savedAddresses.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {savedAddresses.map((a) => {
                    const label = `${a.fullName ?? ""} • ${a.house ?? ""}, ${a.road ?? ""} • ${a.city ?? ""}`;
                    const isChecked = selectedAddressId === a.id;
                    return (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-all duration-200 ${
                          isChecked
                            ? "border-blue-500 bg-blue-500/5 dark:bg-blue-600/10"
                            : "border-white/10 bg-white/[0.035] hover:bg-blue-500/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          className="accent-blue-600 mt-1"
                          checked={isChecked}
                          onChange={() => setSelectedAddressId(a.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-black text-white">{label || "Saved address"}</p>
                          {a.phone ? <p className="mt-1 text-xs font-bold text-slate-400">{a.phone}</p> : null}
                          {a.isDefault ? <p className="mt-1.5 text-[10px] font-black uppercase text-blue-500 dark:text-blue-400">Default</p> : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Add New Address Form inputs */}
              {useNewAddress && (
                <>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <h3 className="text-xs font-bold text-neutral-500 dark:text-white/60 uppercase tracking-wider">Add new delivery address</h3>
                    <button
                      onClick={detect}
                      disabled={detecting}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-250 dark:border-white/10 bg-neutral-100 dark:bg-black px-4 py-2 text-xs font-black hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-300 text-neutral-850 dark:text-white disabled:cursor-not-allowed disabled:opacity-60 transition cursor-pointer"
                    >
                      {detecting ? <Loader2 className="animate-spin" size={14} /> : <LocateFixed size={14} />}
                      {detecting ? "Detecting" : "Detect Location"}
                    </button>
                  </div>

                  {address.latitude && address.longitude && (
                    <p className="mt-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-350">
                      Coordinates captured: {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                    </p>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {fields.map((field) => (
                      <input
                        key={field.key}
                        value={String(address[field.key] ?? "")}
                        onChange={(event) => updateAddress(field.key, event.target.value)}
                        className="rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-3 text-sm text-white shadow-inner outline-none transition placeholder:text-slate-500 focus:border-blue-300/70 focus:bg-blue-500/10"
                        placeholder={field.label}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Warning card */}
              <div className="mt-5 flex items-start gap-2.5 rounded-md border border-blue-500/10 dark:border-white/10 bg-blue-500/5 dark:bg-black/20 p-3.5">
                <Shield size={16} className="mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-neutral-600 dark:text-white/60 leading-normal">
                  We use your address for delivery only. Checkout will not clear your cart unless the order is created.
                </p>
              </div>
            </div>

            {/* 2. PAYMENT METHOD SECTION CARD */}
            <div className="electrox-card rounded-[1.5rem] p-5">
              <div className="border-b border-neutral-200 pb-3.5 dark:border-white/10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Step 2</p>
                <h2 className="mt-1 text-lg font-black text-neutral-900 dark:text-white">Choose Payment Method</h2>
                <p className="mt-1 text-xs font-semibold text-neutral-500 dark:text-white/50">
                  Select how you want to pay. Prepaid methods open secure Razorpay checkout.
                </p>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="grid gap-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const isChecked = selectedPaymentOption.id === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`relative flex items-start gap-3 rounded-md border p-4 text-sm transition select-none ${
                        option.disabled
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 opacity-70 dark:border-white/10 dark:bg-black/20 dark:text-white/35"
                          : isChecked
                            ? "cursor-pointer border-blue-400/70 bg-gradient-to-r from-blue-500/15 via-violet-600/15 to-purple-500/15 text-blue-100 shadow-[0_16px_45px_rgba(59,130,246,0.12)]"
                            : "cursor-pointer border-white/10 bg-white/[0.035] text-slate-300 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="mt-1 accent-blue-500"
                        checked={isChecked}
                        disabled={option.disabled}
                        onChange={() => setPaymentChannel(option.id)}
                      />
                      <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-md ${
                        isChecked ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-white/5 text-white"
                      }`}>
                        <Icon size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-black">{option.title}</span>
                          {option.badge && !option.disabled && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                              {option.badge}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-neutral-500 dark:text-white/50">{option.subtitle}</span>
                        {option.disabledReason && <span className="mt-1.5 block text-xs font-black text-blue-500">{option.disabledReason}</span>}
                      </span>
                      {isChecked && <CheckCircle2 size={19} className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-300" />}
                    </label>
                  );
                })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-inner">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-600/15">
                      <SelectedPaymentIcon size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-neutral-950 dark:text-white">{selectedPaymentOption.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-neutral-500 dark:text-white/55">
                        {selectedPaymentOption.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {selectedPaymentOption.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-2 text-xs font-semibold text-neutral-600 dark:text-white/60">
                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-300" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-md border border-blue-500/15 bg-white p-3 dark:bg-white/[0.035]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-neutral-500 dark:text-white/50">Payable now</span>
                      <span className="font-black text-blue-600 dark:text-blue-300">
                        {paymentMethod === "cod" ? "Rs. 0" : formatMoney(total)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-neutral-500 dark:text-white/45">
                      {paymentMethod === "cod"
                        ? `You will pay ${formatMoney(total)} at delivery.`
                        : "You will be redirected to Razorpay after placing the order."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ORDER SUMMARY SIDEBAR */}
          <aside className="electrox-card h-fit rounded-[1.5rem] p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-white">Summary</h2>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Items Breakdown list with proper contrast */}
            <div className="mt-4 flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-neutral-600 dark:text-white/70 truncate max-w-[240px]">
                    {item.title} <span className="text-neutral-400 dark:text-white/45 font-medium">x {item.quantity}</span>
                  </span>
                  <span className="font-black text-neutral-800 dark:text-white flex-shrink-0">{formatMoney(item.salePrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Apply coupon card */}
            <div className="mt-5 border-t border-neutral-200 dark:border-white/10 pt-5">
              <form onSubmit={applyCoupon} className="mb-5 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/25 p-4 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-white/50 uppercase tracking-wider">
                  <Tag size={14} className="text-blue-500 dark:text-blue-400" />
                  Apply coupon
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    disabled={Boolean(couponQuote)}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-md border border-neutral-250 dark:border-white/10 bg-white dark:bg-black px-3.5 py-2.5 text-sm text-neutral-800 dark:text-white outline-none focus:border-blue-500 transition shadow-inner placeholder:text-neutral-400 dark:placeholder:text-white/30 disabled:opacity-75"
                  />
                  {couponQuote ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponQuote(null);
                        setCouponError("");
                      }}
                      className="grid h-11 w-11 place-items-center rounded-md border border-neutral-250 dark:border-white/10 bg-neutral-100 dark:bg-black text-neutral-700 dark:text-white hover:border-blue-500 transition cursor-pointer"
                      aria-label="Remove coupon"
                    >
                      <X size={17} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={applyingCoupon}
                      className="min-h-11 rounded-md bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60 transition cursor-pointer"
                    >
                      {applyingCoupon ? "Applying" : "Apply"}
                    </button>
                  )}
                </div>
                {couponQuote && (
                  <p className="mt-2.5 text-xs font-black text-emerald-600 dark:text-emerald-350">
                    {couponQuote.code} applied. You saved {formatMoney(couponQuote.discountAmount)}.
                  </p>
                )}
                {couponError && <p className="mt-2.5 text-xs font-black text-blue-500 dark:text-blue-400">{couponError}</p>}
              </form>

              {/* Order Calculations row */}
              <div className="flex flex-col gap-1.5 border-b border-neutral-200 dark:border-white/10 pb-3">
                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-white/60">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-800 dark:text-white">{formatMoney(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-white/60">
                  <span>Shipping</span>
                  <span className="font-bold text-neutral-800 dark:text-white">{shipping === 0 ? "Free" : formatMoney(shipping)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm font-bold text-emerald-600 dark:text-emerald-350">
                    <span>Coupon discount</span>
                    <span>-{formatMoney(discount)}</span>
                  </div>
                )}
              </div>

              {/* Total Payable Row */}
              <div className="mt-3.5 flex items-center justify-between text-base font-black text-neutral-900 dark:text-white">
                <span>Total</span>
                <span className="text-blue-400 dark:text-blue-400 text-lg">{formatMoney(total)}</span>
              </div>
            </div>

            {/* Place Order Trigger */}
            <Button
              className="mt-6 w-full py-3 font-black uppercase tracking-wider text-xs shadow-lg"
              disabled={!items.length || placing || !isAuthed || checkingAuth}
              onClick={placeOrder}
            >
              {checkingAuth
                ? "Checking..."
                : placing
                  ? paymentMethod === "cod"
                    ? "Placing order..."
                    : "Opening payment..."
                  : isAuthed
                    ? paymentMethod === "cod"
                      ? "Place COD order"
                      : `Pay ${formatMoney(total)} securely`
                    : "Login required"}
            </Button>

            <p className="mt-3.5 text-center text-xs text-neutral-400 dark:text-white/45 font-medium leading-relaxed">
              Tip: If you leave before checkout completes, the cart stays intact.
            </p>
          </aside>
        </div>
      </div>

      {showSandboxModal && (
        <SandboxPaymentModal
          orderId={showSandboxModal.orderId}
          total={showSandboxModal.total}
          razorpayOrderId={showSandboxModal.razorpayOrderId}
          onSuccess={handleSandboxSuccess}
          onCancel={() => setShowSandboxModal(null)}
        />
      )}
    </div>
  );
}

function SandboxPaymentModal({
  orderId,
  total,
  razorpayOrderId,
  onSuccess,
  onCancel
}: {
  orderId: string;
  total: number;
  razorpayOrderId: string;
  onSuccess: (paymentId: string, signature: string) => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSimulate(success: boolean) {
    if (!success) {
      toast.error("Payment simulation cancelled/failed.");
      onCancel();
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const dummyPaymentId = `rzp_dev_pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const dummySignature = `rzp_dev_sig_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    onSuccess(dummyPaymentId, dummySignature);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-md border border-neutral-200 dark:border-dashed dark:border-blue-500/40 bg-white dark:bg-[#101010] p-7 text-neutral-900 dark:text-white shadow-2xl">
        <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
          <span className="h-2 w-2 animate-ping rounded-full bg-blue-500 dark:bg-blue-400" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Razorpay Sandbox Mode</h2>
        </div>
        <h1 className="mt-4 text-2xl font-black text-neutral-950 dark:text-white">Simulate Razorpay Payment</h1>
        <p className="mt-2 text-xs font-semibold text-neutral-500 dark:text-white/50 leading-relaxed">
          Your server is currently running in development mode without live Razorpay API keys.
          Below you can simulate either a successful or failed payment transaction.
        </p>

        <div className="mt-5 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] p-4 text-left text-sm">
          <div className="flex justify-between font-bold text-neutral-600 dark:text-white/70">
            <span>Order ID:</span>
            <span className="text-neutral-900 dark:text-white font-mono">{orderId}</span>
          </div>
          <div className="mt-2.5 flex justify-between font-bold text-neutral-600 dark:text-white/70">
            <span>Razorpay Order ID:</span>
            <span className="font-mono text-xs text-neutral-900 dark:text-white">{razorpayOrderId}</span>
          </div>
          <div className="mt-2.5 flex justify-between border-t border-neutral-200 dark:border-white/10 pt-3.5 text-base font-black text-neutral-900 dark:text-white">
            <span>Total Payable:</span>
            <span className="text-blue-600 dark:text-blue-300">{formatMoney(total)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSimulate(false)}
            className="rounded-md border border-neutral-250 dark:border-white/10 bg-neutral-100 dark:bg-black py-3 text-sm font-black text-neutral-800 dark:text-white hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-300 disabled:opacity-50 transition cursor-pointer"
          >
            Cancel / Fail
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSimulate(true)}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-50 transition cursor-pointer"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Processing..." : "Pay Success"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessPopup({ orderId, total }: { orderId: string; total: number }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-md border border-neutral-200 dark:border-blue-500/30 bg-white dark:bg-[#101010] p-7 text-center text-neutral-900 dark:text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="cracker-burst absolute h-2 w-2 rounded-full"
              style={{
                left: `${12 + ((index * 17) % 78)}%`,
                top: `${10 + ((index * 23) % 70)}%`,
                animationDelay: `${index * 0.08}s`,
                backgroundColor: index % 3 === 0 ? "#eab308" : index % 3 === 1 ? "#ef4444" : "#3b82f6"
              }}
            />
          ))}
        </div>
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-white shadow-[0_0_24px_rgba(59,130,246,0.4)]">
          <PartyPopper size={32} />
        </div>
        <h1 className="relative mt-5 text-2xl font-black text-neutral-950 dark:text-white tracking-tight">Your order has been placed</h1>
        <p className="relative mt-2 text-sm text-neutral-500 dark:text-white/60 leading-normal">
          We have received your order and started preparing the parcel.
        </p>
        <div className="relative mt-5 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/35 p-4 text-left shadow-inner">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-neutral-500 dark:text-white/50">Order ID</span>
            <span className="font-black text-neutral-800 dark:text-white">{orderId}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-neutral-200 dark:border-white/10 pt-2.5 gap-3 text-sm">
            <span className="font-bold text-neutral-500 dark:text-white/50">Total</span>
            <span className="font-black text-blue-600 dark:text-blue-300">{formatMoney(total)}</span>
          </div>
        </div>
        <p className="relative mt-6 text-xs font-black uppercase tracking-[0.2em] text-blue-400 dark:text-blue-400">
          Redirecting to My Orders in 5 seconds
        </p>
      </div>
    </div>
  );
}
