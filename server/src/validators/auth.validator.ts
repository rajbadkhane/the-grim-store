import { z } from "zod";

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2).optional(),
    purpose: z.enum(["signup", "login", "reset"])
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
    name: z.string().min(2).optional(),
    phone: z.string().min(7).optional(),
    purpose: z.enum(["signup", "login", "reset"])
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
    password: z.string().min(8)
  })
});
