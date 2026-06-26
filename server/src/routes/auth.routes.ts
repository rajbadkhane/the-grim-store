import { Router } from "express";
import { adminLogin, forgotPassword, logout, me, refreshToken, requestOtp, resetPasswordController, verifyOtp, googleLogin, googleRedirect, register, loginWithPassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { adminLoginSchema, googleLoginSchema, requestOtpSchema, resetPasswordSchema, verifyOtpSchema } from "../validators/auth.validator.js";

export const authRoutes = Router();

authRoutes.post("/request-otp", authLimiter, validate(requestOtpSchema), requestOtp);
authRoutes.post("/verify-otp", authLimiter, validate(verifyOtpSchema), verifyOtp);
authRoutes.post("/admin/login", authLimiter, validate(adminLoginSchema), adminLogin);
authRoutes.post("/resend-otp", authLimiter, validate(requestOtpSchema), requestOtp);
authRoutes.post("/forgot-password", authLimiter, validate(requestOtpSchema), forgotPassword);
authRoutes.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPasswordController);
authRoutes.post("/refresh", refreshToken);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);

authRoutes.post("/register", authLimiter, register);
authRoutes.post("/password-login", authLimiter, loginWithPassword);
authRoutes.post("/google-login", authLimiter, validate(googleLoginSchema), googleLogin);
authRoutes.post("/google-redirect", authLimiter, googleRedirect);
