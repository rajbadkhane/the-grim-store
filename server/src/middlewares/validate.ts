import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!parsed.success) {
      return next(new ApiError(422, "Validation failed", parsed.error.flatten()));
    }
    const data = parsed.data as any;
    if ("body" in data) req.body = data.body;
    if ("query" in data) req.query = data.query;
    if ("params" in data) Object.assign(req.params, data.params);
    next();
  };
