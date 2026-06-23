export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 48;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: SESSION_MAX_AGE_MS
};

export const orderStatuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"] as const;
export const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;
