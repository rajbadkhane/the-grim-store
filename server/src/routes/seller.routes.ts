import { Router } from "express";
import { createSellerRequest, listSellerRequests, updateSellerRequest } from "../controllers/seller.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const sellerRoutes = Router();

sellerRoutes.post("/", createSellerRequest);
sellerRoutes.get("/", requireAuth, requireAdmin, listSellerRequests);
sellerRoutes.patch("/:id", requireAuth, requireAdmin, updateSellerRequest);
