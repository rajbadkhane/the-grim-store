import { Router } from "express";
import { dashboard, getPage, listCoupons, toggleCouponActive, upsertCoupon, upsertPage } from "../controllers/admin.controller.js";
import { listUsers, toggleBlockUser } from "../controllers/user.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);
adminRoutes.get("/dashboard", dashboard);
adminRoutes.get("/users", listUsers);
adminRoutes.patch("/users/:id/block", toggleBlockUser);
adminRoutes.get("/coupons", listCoupons);
adminRoutes.post("/coupons", upsertCoupon);
adminRoutes.patch("/coupons/:id/active", toggleCouponActive);
adminRoutes.get("/pages/:slug", getPage);
adminRoutes.put("/pages/:slug", upsertPage);
