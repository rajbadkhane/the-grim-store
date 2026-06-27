import { Router } from "express";
import { archiveSellerProduct, createSellerProduct, listSellerOrders, listSellerProducts, sellerMe, updateSellerProduct } from "../controllers/seller-panel.controller.js";
import { requireAuth, requireSellerOrAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { productSchema } from "../validators/product.validator.js";

export const sellerPanelRoutes = Router();

sellerPanelRoutes.use(requireAuth, requireSellerOrAdmin);
sellerPanelRoutes.get("/me", sellerMe);
sellerPanelRoutes.get("/products", listSellerProducts);
sellerPanelRoutes.post("/products", validate(productSchema), createSellerProduct);
sellerPanelRoutes.patch("/products/:id", validate(productSchema), updateSellerProduct);
sellerPanelRoutes.delete("/products/:id", archiveSellerProduct);
sellerPanelRoutes.get("/orders", listSellerOrders);
