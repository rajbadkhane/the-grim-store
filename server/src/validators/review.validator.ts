import { z } from "zod";

export const reviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    orderId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(3).max(120),
    comment: z.string().min(10).max(2000),
    images: z.array(z.object({ url: z.string().url(), alt: z.string(), publicId: z.string().optional() })).default([])
  })
});

export const manualReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    userName: z.string().min(2).max(160),
    userAvatar: z.string().url().optional().or(z.literal("")),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(3).max(120),
    comment: z.string().min(10).max(2000),
    images: z.array(z.object({ url: z.string().url(), alt: z.string().optional(), publicId: z.string().optional() })).default([]),
    verifiedPurchase: z.boolean().default(true)
  })
});
