import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { getUserById } from "../lib/sql.js";

type TokenPayload = { id: string };

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const bearer = req.headers.authorization?.replace("Bearer ", "");
    const token = req.cookies?.accessToken || bearer;
    if (!token) throw new ApiError(401, "Authentication required");
    const payload = verifyAccessToken<TokenPayload>(token);
    const user = await getUserById(payload.id);
    if (!user || user.isBlocked) throw new ApiError(401, "Invalid session");
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return next(new ApiError(403, "Admin access required"));
  next();
}
