export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 72
};

export const orderStatuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"] as const;
export const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;
