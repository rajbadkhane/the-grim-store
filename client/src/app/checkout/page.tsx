"use client";

import { Banknote, CheckCircle2, CreditCard, Landmark, LocateFixed, Loader2, PartyPopper, Shield, Smartphone, Tag, Wallet, X, MapPin, type LucideIcon } from "lucide-react";
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
import { checkoutPageJsonLd } from "@/lib/seo";

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

  const [checkingAuth, setCheckingAuth] = useState(false);
  const [isAuthed, setIsAuthed] = useState(true);
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
      setIsAuthed(true);
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
        setIsAuthed(true); // Always allow checkout in offline/demo mode
      } catch {
        if (cancelled) return;
        setIsAuthed(true); // Always allow checkout in offline/demo mode
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f5f6] dark:bg-[#0f0f0f]">
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-[#282c3f] dark:text-white">Your cart is empty</h1>
          <p className="mt-3 text-sm text-[#7e808c] dark:text-neutral-400">Add items to your cart before checking out.</p>
          <Link href="/products" className="mt-6 inline-block">
            <button className="bg-[var(--accent)] hover:bg-[#e6355e] text-white px-6 py-3 font-bold uppercase text-xs tracking-wider transition rounded-none">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f5f6] dark:bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
          <h1 className="text-lg font-bold text-[#282c3f] dark:text-white">Checking authentication...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f5f6] dark:bg-[#0f0f0f]">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#282c3f] dark:text-white">Login Required</h1>
          <p className="mt-3 text-sm text-[#7e808c] dark:text-neutral-400">Please authenticate to access shipping details and complete your checkout.</p>
          <button
            onClick={openLoginModal}
            className="mt-6 bg-[var(--accent)] hover:bg-[#e6355e] text-white px-8 py-3.5 font-bold uppercase tracking-wider text-xs transition rounded-none"
          >
            Log In Now
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[#f9f9f9] px-4 text-[#1a1c1c] dark:bg-[#0A0A0A] dark:text-white">
        <div className="w-full max-w-lg border border-[#e5bdb8] bg-white p-8 text-center shadow-sm dark:border-[#3a1f1f] dark:bg-[#130b0b]">
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="relative h-16 w-16 overflow-visible">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" aria-hidden="true" />
            </span>
            <span className="grim-wordmark grim-wordmark-inline text-[24px] text-[#0A0A0A] dark:text-white" aria-label="The Grim Store">
              <span className="grim-wordmark-kicker">The</span>
              <span>Grim</span>
              <span>Store</span>
            </span>
          </div>
          <h1 className="font-heading text-2xl uppercase tracking-wide">No items to checkout</h1>
          <p className="mt-3 text-sm font-semibold text-[#5c403c] dark:text-white/60">Your checkout only uses real cart or buy-now items. Add products from the live catalog to continue.</p>
          <Link href="/products" className="mt-6 inline-flex h-11 items-center justify-center bg-[#FF3B30] px-7 text-xs font-black uppercase tracking-widest text-white">
            Go to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f9f9f9] text-[#424553] dark:bg-[#0A0A0A] dark:text-neutral-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(checkoutPageJsonLd()) }} />
      
      {/* Checkout Progress Timeline Header */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-850 bg-[#f4f0e6] dark:bg-[#0f1113]">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-[#0A0A0A] dark:text-white">
            <span className="relative h-10 w-10 overflow-visible">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" aria-hidden="true" />
            </span>
            <span className="grim-wordmark grim-wordmark-inline text-[21px]">
              <span className="grim-wordmark-kicker">The</span>
              <span>Grim</span>
              <span>Store</span>
            </span>
          </Link>
          <div className="flex gap-6 text-[11px] font-black uppercase tracking-wider text-neutral-500">
            <Link href="/products" className="hover:text-neutral-800 dark:hover:text-white transition-colors">SHOP</Link>
            <Link href="#/about" className="hover:text-neutral-800 dark:hover:text-white transition-colors">ABOUT</Link>
            <Link href="#/help" className="hover:text-neutral-800 dark:hover:text-white transition-colors">HELP</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-8 pb-4 flex flex-col md:flex-row md:items-baseline md:justify-between border-b border-neutral-200/80 dark:border-neutral-850">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#282c3f] dark:text-white">CHECKOUT</h1>
        <div className="mt-2 md:mt-0 flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <span className="text-[#282c3f] dark:text-white">1. SHIPPING & PAYMENT</span>
          <span className="text-neutral-400">&gt;</span>
          <span className="text-neutral-400 dark:text-neutral-500">2. REVIEW</span>
          <span className="text-neutral-400">&gt;</span>
          <span className="text-neutral-400 dark:text-neutral-500">3. CONFIRMATION</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* LEFT COLUMN: Shipping & Payment */}
          <section className="grid gap-6">
            
            {/* SHIPPING ADDRESS SECTION CARD */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-6 rounded-2xl shadow-sm">
              <div className="mb-4 flex flex-col gap-3 border-b border-neutral-100 dark:border-neutral-850 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-black uppercase tracking-wider text-[#282c3f] dark:text-white">
                  Shipping Address
                </h2>

                <div className="flex gap-2">
                  {!useNewAddress && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className="cursor-pointer border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-4 py-2 text-xs font-bold text-[#282c3f] dark:text-white transition hover:border-neutral-800 rounded-lg shadow-sm"
                      onClick={() => setUseNewAddress(true)}
                    >
                      Edit Address
                    </button>
                  )}
                  {useNewAddress && (
                    <button
                      type="button"
                      className="cursor-pointer border border-[#d4d5d9] dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-xs font-bold text-[#282c3f] dark:text-white transition hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-none"
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
                <div className="flex items-center gap-2 mt-3 text-xs font-bold text-[#7e808c]">
                  <Loader2 className="animate-spin text-[var(--accent)]" size={14} />
                  <span>Loading saved addresses...</span>
                </div>
              )}

              {/* Saved Address Radio Picker */}
              {!useNewAddress && savedAddresses.length > 0 && (
                <div className="mt-4 flex flex-col gap-4">
                  {savedAddresses.map((a) => {
                    const isChecked = selectedAddressId === a.id;
                    return (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer items-center justify-between gap-4 border p-5 transition-all duration-200 rounded-2xl bg-white dark:bg-[#16181b] ${
                          isChecked
                            ? "border-[#1a253c] dark:border-white ring-1 ring-[#1a253c] dark:ring-white shadow-[0_4px_16px_rgba(26,37,60,0.08)]"
                            : "border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-[#111315] hover:border-neutral-400"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="radio"
                            name="savedAddress"
                            className="accent-[#1a253c] dark:accent-white mt-1 h-4 w-4"
                            checked={isChecked}
                            onChange={() => setSelectedAddressId(a.id)}
                          />
                          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 space-y-1">
                            <p className="text-sm font-black uppercase text-[#282c3f] dark:text-white tracking-wider">{a.addressType}</p>
                            <p className="text-neutral-850 dark:text-white font-bold text-sm">{a.fullName}</p>
                            <p>{a.house}</p>
                            <p>{a.road}</p>
                            <p>{a.city}</p>
                          </div>
                        </div>

                        {/* Mini Coordinates Map Grid */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#eaeaea] dark:bg-neutral-900 p-2 w-[140px] select-none">
                          <div className="relative h-14 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800 border border-neutral-300/45 dark:border-neutral-700/40">
                            {/* Grid lines */}
                            <div className="absolute inset-0 opacity-40">
                              <div className="absolute top-4 left-0 right-0 h-0.5 bg-white"></div>
                              <div className="absolute top-10 left-0 right-0 h-0.5 bg-white"></div>
                              <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-white"></div>
                              <div className="absolute top-0 bottom-0 left-18 w-0.5 bg-white"></div>
                              <div className="absolute top-0 bottom-0 left-26 w-0.5 bg-white"></div>
                            </div>
                            {/* Map pin */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <MapPin size={22} className="text-[#1a253c] dark:text-white fill-[#1a253c] relative z-10" />
                            </div>
                          </div>
                          <div className="text-[9.5px] font-bold text-neutral-500 dark:text-neutral-400 text-center leading-normal">
                            <div>Latitude: {a.latitude}</div>
                            <div>longitude: {a.longitude}</div>
                          </div>
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
                    <h3 className="text-xs font-bold text-[#7e808c] uppercase tracking-wider">Add new delivery address</h3>
                    <button
                      type="button"
                      onClick={detect}
                      disabled={detecting}
                      className="inline-flex items-center gap-2 border border-[#d4d5d9] dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-xs font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] text-[#282c3f] dark:text-white disabled:cursor-not-allowed disabled:opacity-60 transition cursor-pointer rounded-none"
                    >
                      {detecting ? <Loader2 className="animate-spin text-[var(--accent)]" size={14} /> : <LocateFixed size={14} />}
                      {detecting ? "Detecting" : "Detect Location"}
                    </button>
                  </div>

                  {address.latitude && address.longitude && (
                    <p className="mt-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      Coordinates captured: {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                    </p>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {fields.map((field) => (
                      <input
                        key={field.key}
                        value={String(address[field.key] ?? "")}
                        onChange={(event) => updateAddress(field.key, event.target.value)}
                        className="rounded-none border border-[#d4d5d9] dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 text-sm text-[#282c3f] dark:text-white outline-none transition placeholder:text-neutral-450 focus:border-[var(--accent)] focus:bg-white"
                        placeholder={field.label}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Warning card */}
              <div className="mt-5 flex items-start gap-2.5 border border-red-500/20 bg-red-500/[0.02] p-4 rounded-xl">
                <Shield size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-650 dark:text-red-300 leading-normal font-semibold">
                  We use your address for delivery only. Checkout will not clear your cart unless the order is created.
                </p>
              </div>
            </div>

            {/* PAYMENT METHOD SECTION CARD */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-6 rounded-2xl shadow-sm">
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-4">
                <h2 className="text-base font-black uppercase tracking-wider text-[#282c3f] dark:text-white">
                  Payment Method
                </h2>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {/* UPI */}
                <label
                  onClick={() => setPaymentChannel("upi")}
                  className={`flex cursor-pointer items-start gap-4 border p-5 transition duration-200 rounded-2xl ${
                    paymentChannel === "upi"
                      ? "border-[#1a253c] dark:border-white bg-[#eaeaea]/30 dark:bg-neutral-800 shadow-[0_4px_16px_rgba(26,37,60,0.04)]"
                      : "border-neutral-200 dark:border-neutral-850 bg-white dark:bg-[#111315] hover:border-neutral-400"
                  }`}
                >
                  {paymentChannel === "upi" ? (
                    <div className="mt-1 h-5 w-5 rounded-full bg-[#1a253c] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-[3.5]" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="mt-1 h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-extrabold text-[#282c3f] dark:text-white">UPI (Google Pay, PhonePe)</p>
                    <div className="mt-2 flex items-center gap-2 select-none">
                      {/* Google Pay */}
                      <div className="h-5 px-2 bg-white rounded border border-neutral-250 flex items-center justify-center text-[9px] font-black tracking-tight select-none">
                        <span className="text-[#111111]">G</span>
                        <span className="text-[#EA4335]">P</span>
                        <span className="text-[#FBBC05]">a</span>
                        <span className="text-[#D71920]">y</span>
                      </div>
                      {/* PhonePe */}
                      <div className="h-5 w-5 bg-[#D71920] rounded-full flex items-center justify-center text-[9px] font-black text-white select-none">
                        पे
                      </div>
                      {/* UPI Logo */}
                      <div className="h-5 px-2 bg-white rounded border border-neutral-250 flex items-center justify-center text-[8px] font-black italic tracking-tighter text-[#111111] select-none">
                        UPI<span className="text-[#D71920] font-extrabold ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Card */}
                <label
                  onClick={() => setPaymentChannel("card")}
                  className={`flex cursor-pointer items-start gap-4 border p-5 transition duration-200 rounded-2xl ${
                    paymentChannel === "card"
                      ? "border-[#1a253c] dark:border-white bg-[#eaeaea]/30 dark:bg-neutral-800 shadow-[0_4px_16px_rgba(26,37,60,0.04)]"
                      : "border-neutral-200 dark:border-neutral-850 bg-white dark:bg-[#111315] hover:border-neutral-400"
                  }`}
                >
                  {paymentChannel === "card" ? (
                    <div className="mt-1 h-5 w-5 rounded-full bg-[#1a253c] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-[3.5]" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="mt-1 h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-extrabold text-[#282c3f] dark:text-white">Credit/Debit Card</p>
                    <div className="mt-2 flex items-center gap-2 select-none">
                      {/* Mastercard */}
                      <div className="h-5 px-2 bg-white rounded border border-neutral-250 flex items-center justify-center gap-0.5 select-none">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#eb001b] opacity-90"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f00] -ml-1.5 opacity-90"></span>
                      </div>
                      {/* VISA */}
                      <div className="h-5 px-2 bg-[#111111] rounded flex items-center justify-center text-[8px] font-extrabold italic text-white tracking-wider select-none">
                        VISA
                      </div>
                      {/* Amex */}
                      <div className="h-5 px-2 bg-[#D71920] rounded flex items-center justify-center text-[7px] font-black text-white select-none">
                        AMEX
                      </div>
                      {/* RuPay */}
                      <div className="h-5 px-2 bg-white rounded border border-neutral-250 flex items-center justify-center text-[8px] font-black italic tracking-tighter text-[#0a2240] select-none">
                        RuPay<span className="text-orange-500 font-extrabold ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => {
                    if (total <= codLimit) setPaymentChannel("cod");
                  }}
                  className={`flex cursor-pointer items-start gap-4 border p-5 transition duration-200 rounded-2xl ${
                    total > codLimit ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    paymentChannel === "cod"
                      ? "border-[#1a253c] dark:border-white bg-[#eaeaea]/30 dark:bg-neutral-800 shadow-[0_4px_16px_rgba(26,37,60,0.04)]"
                      : "border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-[#111315] hover:border-neutral-400"
                  }`}
                >
                  {paymentChannel === "cod" ? (
                    <div className="mt-1 h-5 w-5 rounded-full bg-[#1a253c] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-[3.5]" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="mt-1 h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-extrabold text-[#282c3f] dark:text-white">Cash on Delivery</p>
                    {total > codLimit && (
                      <p className="mt-1 text-xs text-rose-500 font-semibold">COD is available up to Rs. 5,000.</p>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
          <aside className="bg-white dark:bg-[#16181b] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="text-lg font-black text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Order Summary
            </h2>

            {/* Items Breakdown list */}
            <div className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-xs font-semibold">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {item.quantity}× {item.title}
                  </span>
                  <span className="text-neutral-850 dark:text-white font-bold flex-shrink-0">
                    {item.salePrice * item.quantity > 0 ? formatMoney(item.salePrice * item.quantity) : ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations List */}
            <div className="mt-6 border-t border-neutral-100 dark:border-neutral-800 pt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-850 dark:text-white">{formatMoney(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Shipping</span>
                <span className="font-bold text-neutral-850 dark:text-white">{formatMoney(shipping)}</span>
              </div>

              {discount > 0 && (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Discount Coupon</span>
                    <span className="font-bold text-neutral-850 dark:text-white">-{formatMoney(discount)}</span>
                  </div>
                  {couponQuote && (
                    <span className="text-[10px] font-bold text-neutral-450 uppercase pl-1">{couponQuote.code}</span>
                  )}
                </div>
              )}
            </div>

            {/* Grand Total Row */}
            <div className="mt-4 border-t border-neutral-100 dark:border-neutral-800 pt-4 flex items-center justify-between text-base font-black text-neutral-900 dark:text-white">
              <span>Grand Total</span>
              <span>{formatMoney(total)}</span>
            </div>

            {/* Apply coupon inline input card */}
            <div className="mt-5">
              <form onSubmit={applyCoupon} className="relative flex items-center bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-1">
                <input
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  disabled={Boolean(couponQuote)}
                  placeholder="Apply Coupon"
                  className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-xs font-bold text-foreground outline-none placeholder:text-neutral-400 disabled:opacity-75 focus:shadow-none"
                />
                {couponQuote ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponCode("");
                      setCouponQuote(null);
                      setCouponError("");
                    }}
                    className="grid h-8 w-8 place-items-center text-neutral-450 hover:text-red-500 transition-colors shrink-0"
                    aria-label="Remove coupon"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="bg-[#1a253c] hover:bg-[#2b3956] h-8 w-8 rounded-full flex items-center justify-center text-white transition-colors shrink-0 disabled:opacity-50"
                  >
                    →
                  </button>
                )}
              </form>
              {couponQuote && (
                <p className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 pl-1">
                  Coupon applied successfully!
                </p>
              )}
              {couponError && <p className="mt-2 text-[10px] font-semibold text-rose-500 pl-1">{couponError}</p>}
            </div>

            {/* Step Action Trigger (Desktop only) */}
            <div className="mt-6">
              <button
                disabled={!items.length || placing || !isAuthed || checkingAuth}
                onClick={placeOrder}
                className="hidden lg:flex w-full py-4 bg-[#1a253c] hover:bg-[#2b3956] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-full shadow-md items-center justify-center gap-2"
              >
                {placing ? <Loader2 className="animate-spin" size={14} /> : null}
                Verify & Pay {formatMoney(total)}
              </button>
            </div>

            <p className="mt-3.5 text-center text-[10px] text-[#94969f] leading-relaxed">
              Tip: If you leave before checkout completes, the cart stays intact.
            </p>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation Action Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-45 border-t border-neutral-200 dark:border-neutral-850 bg-white/97 dark:bg-[#111315]/97 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:hidden flex items-center justify-between gap-4">
          <div className="flex flex-col pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 leading-none">Total Payable</span>
            <span className="text-sm font-extrabold text-[var(--accent)] mt-1">{formatMoney(total)}</span>
          </div>
          <button
            disabled={placing || !isAuthed || checkingAuth}
            onClick={placeOrder}
            className="flex-1 max-w-[220px] h-11 flex items-center justify-center bg-[#1a253c] hover:bg-[#2b3956] disabled:bg-neutral-250 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 disabled:cursor-not-allowed text-xs font-bold text-white rounded uppercase tracking-wider transition-colors"
          >
            {checkingAuth ? (
              "Checking..."
            ) : placing ? (
              paymentMethod === "cod" ? "Placing..." : "Opening..."
            ) : isAuthed ? (
              paymentMethod === "cod" ? "Place COD" : `Pay ${formatMoney(total)}`
            ) : (
              "Login required"
            )}
          </button>
        </div>
      )}

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
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm store-shell p-7 text-[#424553] dark:text-white">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <span className="h-2 w-2 animate-ping rounded-full bg-[var(--accent)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Razorpay Sandbox Mode</h2>
        </div>
        <h1 className="mt-4 text-xl font-bold text-[#282c3f] dark:text-white">Simulate Razorpay Payment</h1>
        <p className="mt-2 text-xs text-[#7e808c] leading-relaxed">
          Your server is currently running in development mode without live Razorpay API keys.
          Below you can simulate either a successful or failed payment transaction.
        </p>

        <div className="mt-5 rounded-none border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 text-left text-xs font-semibold">
          <div className="flex justify-between text-[#7e808c]">
            <span>Order ID:</span>
            <span className="text-[#282c3f] dark:text-white font-mono">{orderId}</span>
          </div>
          <div className="mt-2.5 flex justify-between text-[#7e808c]">
            <span>Razorpay Order ID:</span>
            <span className="font-mono text-[#282c3f] dark:text-white">{razorpayOrderId}</span>
          </div>
          <div className="mt-2.5 flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-3 text-sm font-bold text-[#282c3f] dark:text-white">
            <span>Total Payable:</span>
            <span className="text-[var(--accent)]">{formatMoney(total)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSimulate(false)}
            className="rounded-none border border-[#d4d5d9] dark:border-neutral-800 bg-white dark:bg-neutral-950 py-3 text-xs font-bold text-[#424553] dark:text-white hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 transition cursor-pointer uppercase tracking-wider"
          >
            Cancel / Fail
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSimulate(true)}
            className="flex items-center justify-center gap-2 rounded-none bg-[var(--accent)] py-3 text-xs font-bold text-white hover:bg-[#e6355e] disabled:opacity-50 transition cursor-pointer uppercase tracking-wider"
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
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm store-shell p-7 text-center text-[#424553] dark:text-white">
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="cracker-burst absolute h-2 w-2 rounded-full"
              style={{
                left: `${12 + ((index * 17) % 78)}%`,
                top: `${10 + ((index * 23) % 70)}%`,
                animationDelay: `${index * 0.08}s`,
                backgroundColor: index % 3 === 0 ? "var(--accent)" : index % 3 === 1 ? "#3b82f6" : "#eab308"
              }}
            />
          ))}
        </div>
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--accent)] text-white shadow-[0_0_24px_rgba(255,63,108,0.4)]">
          <PartyPopper size={32} />
        </div>
        <h1 className="relative mt-5 text-xl font-bold text-[#282c3f] dark:text-white tracking-tight">Your order has been placed</h1>
        <p className="relative mt-2 text-xs text-[#7e808c] leading-normal">
          We have received your order and started preparing the parcel.
        </p>
        <div className="relative mt-5 rounded-none border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 text-left shadow-none text-xs font-semibold">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#7e808c]">Order ID</span>
            <span className="font-bold text-[#282c3f] dark:text-white">{orderId}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2.5 gap-3 text-xs font-bold text-[#282c3f] dark:text-white">
            <span className="text-[#7e808c]">Total</span>
            <span className="text-[var(--accent)]">{formatMoney(total)}</span>
          </div>
        </div>
        <p className="relative mt-6 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
          Redirecting to My Orders in 5 seconds
        </p>
      </div>
    </div>
  );
}
