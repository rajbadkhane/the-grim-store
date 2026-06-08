import { env } from "../config/env.js";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getShiprocketToken(): Promise<string | null> {
  if (!env.shiprocketEmail || !env.shiprocketPassword) {
    return null;
  }

  // Token cache check (tokens are generally valid for 10 days)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.shiprocketEmail,
        password: env.shiprocketPassword
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[shiprocket] Auth failed: ${res.status} ${errText}`);
      return null;
    }

    const data = await res.json() as any;
    if (data.token) {
      cachedToken = data.token;
      // Expire in 9 days to be safe
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (err) {
    console.error("[shiprocket] Auth request failed:", err);
  }

  return null;
}

export const shiprocketService = {
  async createShiprocketOrder(order: any) {
    const address = order.shippingAddress;
    const isPrepaid = order.paymentMethod !== "cod";

    const payload = {
      order_id: order.orderId,
      order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace("T", " "),
      pickup_location: "Primary Warehouse", // Default warehouse name in Shiprocket dashboard
      billing_customer_name: address?.fullName?.split(" ")[0] || "Customer",
      billing_last_name: address?.fullName?.split(" ").slice(1).join(" ") || "Store",
      billing_address: address?.house || "Address",
      billing_address_2: address?.road || "",
      billing_city: address?.city || "",
      billing_pincode: address?.pincode || "",
      billing_state: address?.state || "",
      billing_country: "India",
      billing_email: order.user_email || "customer@grimstore.com",
      billing_phone: address?.phone || "0000000000",
      shipping_is_billing: true,
      order_items: (order.products || []).map((p: any) => ({
        name: p.title || "Streetwear item",
        sku: p.sku || p.id || "GENERIC_SKU",
        units: p.quantity || 1,
        selling_price: p.salePrice || p.price || 0,
        discount: 0
      })),
      payment_method: isPrepaid ? "Prepaid" : "COD",
      sub_total: order.totalAmount,
      length: 15, // Default sizes in cm
      breadth: 15,
      height: 10,
      weight: 0.5 // Default weight in kg
    };

    const token = await getShiprocketToken();

    if (!token) {
      // Sandbox fallback mode
      console.log(`[shiprocket:dev] Simulated Shipment Creation for Order: ${order.orderId}`);
      console.log("[shiprocket:dev] Payload:", JSON.stringify(payload, null, 2));
      const simulatedShipmentId = `sr_dev_shipment_${Math.floor(100000 + Math.random() * 900000)}`;
      const simulatedAwbCode = `sr_dev_awb_${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      return {
        success: true,
        isMock: true,
        shipmentId: simulatedShipmentId,
        awbCode: simulatedAwbCode,
        status: "NEW"
      };
    }

    try {
      const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[shiprocket] Order creation failed: ${res.status} ${errText}`);
        return { success: false, error: errText };
      }

      const responseData = await res.json() as any;
      console.log(`[shiprocket] Live Order created successfully: ${order.orderId}`);
      return {
        success: true,
        isMock: false,
        shipmentId: responseData.shipment_id,
        awbCode: responseData.awb_code || null,
        status: "PLACED"
      };
    } catch (err) {
      console.error("[shiprocket] Network error creating order:", err);
      return { success: false, error: String(err) };
    }
  },

  async trackShiprocketOrder(shipmentId: string) {
    const token = await getShiprocketToken();
    if (!token || shipmentId.startsWith("sr_dev_")) {
      console.log(`[shiprocket:dev] Simulated tracking lookup for: ${shipmentId}`);
      return {
        success: true,
        isMock: true,
        status: "In Transit",
        activity: [
          { date: new Date().toISOString(), status: "In Transit", location: "Simulation Hub" },
          { date: new Date(Date.now() - 86400000).toISOString(), status: "Packed", location: "Warehouse" }
        ]
      };
    }

    try {
      const res = await fetch(`${BASE_URL}/shipments/track/shipment_id/${shipmentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }

      const responseData = await res.json() as any;
      return {
        success: true,
        isMock: false,
        status: responseData.tracking_data?.shipment_status || "UNKNOWN",
        activity: responseData.tracking_data?.shipment_track_activities || []
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
};
