import { Router } from "express";
import { applyCoupon, checkout, listMyOrders, listOrders, updateOrderStatus, verifyPayment } from "../controllers/order.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { applyCouponSchema, checkoutSchema, statusSchema } from "../validators/order.validator.js";

export const orderRoutes = Router();

orderRoutes.use(requireAuth);
orderRoutes.post("/apply-coupon", validate(applyCouponSchema), applyCoupon);
orderRoutes.post("/checkout", validate(checkoutSchema), checkout);
orderRoutes.get("/mine", listMyOrders);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", requireAdmin, listOrders);
orderRoutes.patch("/:id/status", requireAdmin, validate(statusSchema), updateOrderStatus);
