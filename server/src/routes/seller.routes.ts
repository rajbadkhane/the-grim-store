import { Router } from "express";
import { createSellerAccount, createSellerRequest, listSellerRequests, setSellerCredentials, updateSellerRequest } from "../controllers/seller.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const sellerRoutes = Router();

sellerRoutes.post("/", createSellerRequest);
sellerRoutes.get("/", requireAuth, requireAdmin, listSellerRequests);
sellerRoutes.post("/accounts", requireAuth, requireAdmin, createSellerAccount);
sellerRoutes.post("/:id/credentials", requireAuth, requireAdmin, setSellerCredentials);
sellerRoutes.patch("/:id", requireAuth, requireAdmin, updateSellerRequest);
