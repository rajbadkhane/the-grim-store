import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";

export const razorpay =
  env.razorpayKeyId && env.razorpaySecret
    ? new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpaySecret })
    : null;

export async function createRazorpayOrder(amountPaise: number, receipt: string, currency = "INR") {
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw new Error("Razorpay order amount must be at least 100 paise");
  }
  if (!razorpay) {
    throw new Error("Razorpay credentials are not configured");
  }

  return razorpay.orders.create({ amount: amountPaise, currency, receipt });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  if (!env.razorpaySecret || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", env.razorpaySecret ?? "").update(`${orderId}|${paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
