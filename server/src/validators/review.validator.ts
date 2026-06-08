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
