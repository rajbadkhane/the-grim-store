import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { sanitizeInput } from "./middlewares/sanitize.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: [env.clientUrl, env.adminUrl, "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(hpp());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), { immutable: true, maxAge: "7d" }));
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);
