import { env } from "../config/env.js";

const BASE_URL = "https://api.nimbuspost.com/v1";
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

type NimbuspostShipmentResult = {
  success: boolean;
  isMock?: boolean;
  shipmentId?: string | number | null;
  awbNumber?: string | null;
  courierId?: string | number | null;
  courierName?: string | null;
  label?: string | null;
  manifest?: string | null;
  status?: string | null;
  error?: string;
  payload?: unknown;
};

function hasNimbuspostCredentials() {
  return Boolean(env.nimbuspostEmail && env.nimbuspostPassword);
}

function hasPickupConfig() {
  return Boolean(
    env.nimbuspostPickupWarehouse &&
      env.nimbuspostPickupName &&
      env.nimbuspostPickupAddress &&
      env.nimbuspostPickupCity &&
      env.nimbuspostPickupState &&
      env.nimbuspostPickupPincode &&
      env.nimbuspostPickupPhone
  );
}

async function nimbuspostRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { status: false, message: text };
  }

  if (!res.ok || data?.status === false) {
    const message = data?.message || `Nimbuspost request failed with HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

async function getNimbuspostToken(): Promise<string | null> {
  if (!hasNimbuspostCredentials()) return null;
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken;

  try {
    const response = await nimbuspostRequest<{ status: boolean; data: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: env.nimbuspostEmail,
        password: env.nimbuspostPassword
      })
    });

    cachedToken = response.data;
    tokenExpiry = Date.now() + 10 * 60 * 60 * 1000;
    return cachedToken;
  } catch (error) {
    console.error("[nimbuspost] Auth failed:", error);
    return null;
  }
}

function digits(value: unknown, fallback = "") {
  const clean = String(value ?? "").replace(/\D/g, "");
  return clean || fallback;
}

function safeString(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

function optionalCourierId() {
  const value = safeString(env.nimbuspostCourierId);
  if (!value || value.toLowerCase() === "autoship") return undefined;
  return value;
}

function buildNimbuspostPayload(order: any) {
  const address = order.shippingAddress ?? {};
  const isCod = order.paymentMethod === "cod";
  const shippingAddressLine = [address.house, address.road].filter(Boolean).join(", ").slice(0, 200);
  const address2 = safeString(address.landmark, "").slice(0, 200);
  const totalAmount = Math.max(1, Math.round(Number(order.totalAmount ?? 0)));
  const items = Array.isArray(order.products) ? order.products : [];
  const courierId = optionalCourierId();

  return {
    order_number: safeString(order.orderId).slice(0, 20),
    shipping_charges: Math.round(Number(order.shippingFee ?? 0)),
    discount: Math.round(Number(order.discountAmount ?? 0)),
    cod_charges: isCod ? 0 : 0,
    payment_type: isCod ? "cod" : "prepaid",
    order_amount: totalAmount,
    package_weight: Math.max(500, Math.round(Number(order.packageWeight ?? 500))),
    package_length: Math.max(10, Math.round(Number(order.packageLength ?? 10))),
    package_breadth: Math.max(10, Math.round(Number(order.packageBreadth ?? 10))),
    package_height: Math.max(10, Math.round(Number(order.packageHeight ?? 10))),
    request_auto_pickup: env.nimbuspostAutoPickup,
    consignee: {
      name: safeString(address.fullName, "Customer").slice(0, 200),
      address: shippingAddressLine || "Address",
      address_2: address2,
      city: safeString(address.city).slice(0, 40),
      state: safeString(address.state).slice(0, 40),
      pincode: digits(address.pincode).slice(0, 6),
      phone: digits(address.phone, "9999999999").slice(-10)
    },
    pickup: {
      warehouse_name: env.nimbuspostPickupWarehouse.slice(0, 20),
      name: env.nimbuspostPickupName.slice(0, 200),
      address: env.nimbuspostPickupAddress.slice(0, 200),
      address_2: env.nimbuspostPickupAddress2.slice(0, 200),
      city: env.nimbuspostPickupCity.slice(0, 40),
      state: env.nimbuspostPickupState.slice(0, 40),
      pincode: digits(env.nimbuspostPickupPincode).slice(0, 6),
      phone: digits(env.nimbuspostPickupPhone).slice(-10)
    },
    order_items: items.map((item: any) => ({
      name: safeString(item.title, "Product").slice(0, 200),
      qty: String(Math.max(1, Number(item.quantity ?? 1))),
      price: String(Math.max(1, Math.round(Number(item.salePrice ?? item.price ?? 1)))),
      sku: safeString(item.sku ?? item.id, "SKU").slice(0, 80)
    })),
    ...(courierId ? { courier_id: courierId } : {}),
    is_insurance: "0",
    tags: "the-grim-store"
  };
}

async function getServiceableCourierIds(payload: any, token: string) {
  const response = await nimbuspostRequest<{ status: boolean; data: any[] }>("/courier/serviceability", {
    method: "POST",
    body: JSON.stringify({
      origin: payload.pickup.pincode,
      destination: payload.consignee.pincode,
      payment_type: payload.payment_type,
      order_amount: String(payload.order_amount),
      weight: String(payload.package_weight),
      length: String(payload.package_length),
      breadth: String(payload.package_breadth),
      height: String(payload.package_height)
    })
  }, token);

  const options = Array.isArray(response.data) ? response.data : [];
  return options
    .filter((option) => option?.id)
    .sort((a, b) => Number(a.total_charges ?? Number.MAX_SAFE_INTEGER) - Number(b.total_charges ?? Number.MAX_SAFE_INTEGER))
    .map((option) => String(option.id));
}

export const nimbuspostService = {
  async createShipment(order: any): Promise<NimbuspostShipmentResult> {
    const payload: any = buildNimbuspostPayload(order);

    if (!hasNimbuspostCredentials()) {
      console.log(`[nimbuspost:skip] Credentials missing for order ${order.orderId}`);
      return { success: false, error: "Nimbuspost credentials are not configured", payload };
    }

    if (!hasPickupConfig()) {
      console.log(`[nimbuspost:skip] Pickup config missing for order ${order.orderId}`);
      return { success: false, error: "Nimbuspost pickup address is not configured", payload };
    }

    const token = await getNimbuspostToken();
    if (!token) return { success: false, error: "Nimbuspost authorization failed", payload };

    try {
      const courierIds = payload.courier_id ? [String(payload.courier_id)] : await getServiceableCourierIds(payload, token);
      if (!courierIds.length) {
        return { success: false, error: "No Nimbuspost courier serviceable for this pickup and delivery pincode", payload };
      }

      let lastError = "";
      for (const courierId of courierIds) {
        try {
          payload.courier_id = courierId;
          const response = await nimbuspostRequest<{ status: boolean; data: any }>("/shipments", {
            method: "POST",
            body: JSON.stringify(payload)
          }, token);
          const data = response.data ?? {};

          return {
            success: true,
            isMock: false,
            shipmentId: data.shipment_id ?? null,
            awbNumber: data.awb_number ?? null,
            courierId: data.courier_id ?? null,
            courierName: data.courier_name ?? null,
            label: data.label ?? null,
            manifest: data.manifest ?? null,
            status: data.status ?? "booked"
          };
        } catch (error: any) {
          lastError = error?.message ?? String(error);
          console.error(`[nimbuspost] Shipment creation failed for courier ${courierId}:`, error);
        }
      }

      return { success: false, error: lastError || "Nimbuspost shipment booking failed for all serviceable couriers", payload };
    } catch (error: any) {
      console.error("[nimbuspost] Shipment creation failed:", error);
      return { success: false, error: error?.message ?? String(error), payload };
    }
  },

  async trackShipment(awbNumber: string) {
    const token = await getNimbuspostToken();
    if (!token) return { success: false, error: "Nimbuspost authorization failed" };

    try {
      const response = await nimbuspostRequest<{ status: boolean; data: any }>(`/shipments/track/${encodeURIComponent(awbNumber)}`, {
        method: "GET"
      }, token);
      return {
        success: true,
        status: response.data?.status ?? "UNKNOWN",
        activity: response.data?.history ?? [],
        data: response.data
      };
    } catch (error: any) {
      return { success: false, error: error?.message ?? String(error) };
    }
  },

  async createManifest(awbNumbers: string[]) {
    const token = await getNimbuspostToken();
    if (!token) return { success: false, error: "Nimbuspost authorization failed" };

    try {
      const response = await nimbuspostRequest<{ status: boolean; data: string }>("/shipments/manifest", {
        method: "POST",
        body: JSON.stringify({ awbs: awbNumbers })
      }, token);
      return { success: true, manifest: response.data };
    } catch (error: any) {
      return { success: false, error: error?.message ?? String(error) };
    }
  }
};
