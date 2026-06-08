import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
