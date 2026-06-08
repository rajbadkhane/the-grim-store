import { Router } from "express";
import { uploadImages } from "../controllers/upload.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

export const uploadRoutes = Router();

uploadRoutes.post("/images", requireAuth, requireAdmin, upload.array("images", 8), uploadImages);
