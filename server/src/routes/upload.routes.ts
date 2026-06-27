import { Router } from "express";
import { uploadImages } from "../controllers/upload.controller.js";
import { requireAuth, requireSellerOrAdmin } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

export const uploadRoutes = Router();

uploadRoutes.post("/images", requireAuth, requireSellerOrAdmin, upload.array("images", 8), uploadImages);
