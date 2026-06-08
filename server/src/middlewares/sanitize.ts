import type { RequestHandler } from "express";

const dangerousKeys = new Set(["__proto__", "constructor", "prototype"]);

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/\son\w+=/gi, "");
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (dangerousKeys.has(key) || key.startsWith("$")) continue;
      result[key] = sanitizeValue(nested);
    }
    return result;
  }
  return value;
}

export const sanitizeInput: RequestHandler = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) Object.assign(req.params, sanitizeValue(req.params));
  next();
};
