import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";

export const razorpay =
  env.razorpayKeyId && env.razorpaySecret
    ? new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpaySecret })
    : null;

export async function createRazorpayOrder(amount: number, receipt: string) {
  if (!razorpay) return { id: `rzp_dev_${receipt}`, amount: amount * 100, currency: "INR", receipt };
  return razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  if (!razorpay || orderId.startsWith("rzp_dev_")) return true;
  const expected = crypto.createHmac("sha256", env.razorpaySecret ?? "").update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}
