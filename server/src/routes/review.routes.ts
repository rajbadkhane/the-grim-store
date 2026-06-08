import { Router } from "express";
import { createReview, deleteReview, helpfulReview, listAllReviews, listReviews, reportReview, updateReview } from "../controllers/review.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { reviewLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { reviewSchema } from "../validators/review.validator.js";

export const reviewRoutes = Router();

reviewRoutes.get("/product/:productId", listReviews);
reviewRoutes.get("/", requireAuth, requireAdmin, listAllReviews);
reviewRoutes.post("/", requireAuth, reviewLimiter, validate(reviewSchema), createReview);
reviewRoutes.patch("/:id", requireAuth, reviewLimiter, updateReview);
reviewRoutes.delete("/:id", requireAuth, deleteReview);
reviewRoutes.post("/:id/helpful", requireAuth, helpfulReview);
reviewRoutes.post("/:id/report", requireAuth, reportReview);
