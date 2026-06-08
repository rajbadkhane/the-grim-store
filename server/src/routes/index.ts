import { Router } from "express";
import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { orderRoutes } from "./order.routes.js";
import { productRoutes } from "./product.routes.js";
import { reviewRoutes } from "./review.routes.js";
import { userRoutes } from "./user.routes.js";
import { uploadRoutes } from "./upload.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/", (_req, res) =>
  res.json({
    success: true,
    service: "grim-store-api",
    version: "v1",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      products: "/api/v1/products",
      users: "/api/v1/users",
      orders: "/api/v1/orders",
      reviews: "/api/v1/reviews",
      uploads: "/api/v1/uploads",
      admin: "/api/v1/admin"
    }
  })
);
apiRoutes.get("/health", (_req, res) => res.json({ success: true, service: "grim-store-api", time: new Date().toISOString() }));
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/products", productRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/orders", orderRoutes);
apiRoutes.use("/reviews", reviewRoutes);
apiRoutes.use("/uploads", uploadRoutes);
apiRoutes.use("/admin", adminRoutes);
