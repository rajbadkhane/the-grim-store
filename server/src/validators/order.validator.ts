import { z } from "zod";

const address = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  pincode: z.string().min(4),
  state: z.string().min(2),
  city: z.string().min(2),
  house: z.string().min(2),
  road: z.string().min(2),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  addressType: z.enum(["home", "work", "other"]).default("home"),
  isDefault: z.boolean().default(false)
});

export const addAddressSchema = z.object({ body: address });

const checkoutProduct = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  image: z.string().optional(),
  salePrice: z.number().nonnegative().optional(),
  quantity: z.number().int().positive(),
  sku: z.string().optional(),
  variantKey: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  pattern: z.string().optional()
});

export const checkoutSchema = z.object({
  body: z.object({
    addressId: z.string().optional(),
    shippingAddress: address.optional(),
    products: z.array(checkoutProduct).optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(["cod", "razorpay"]).default("cod"),
    paymentChannel: z.enum(["cod", "upi", "card", "netbanking", "wallet"]).optional(),
    paymentLabel: z.string().max(80).optional(),
    isDirectBuyNow: z.boolean().optional().default(false)
  })
});

export const applyCouponSchema = z.object({
  body: z.object({
    products: z.array(checkoutProduct).optional(),
    couponCode: z.string().min(1, "Coupon code required")
  })
});

export const statusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"]),
    trackingStatus: z.string().optional()
  })
});
