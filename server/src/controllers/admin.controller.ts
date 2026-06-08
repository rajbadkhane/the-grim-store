import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getDashboardAnalytics } from "../services/analytics.service.js";
import { execute, id, row, rows } from "../lib/sql.js";

export const dashboard = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getDashboardAnalytics() });
});

export const upsertCoupon = asyncHandler(async (req, res) => {
  const payload = normalizeCouponPayload(req.body);
  const { code } = payload;
  const existing = await row("SELECT * FROM coupons WHERE code = :code", { code });
  if (existing) {
    await execute(
      `UPDATE coupons SET discount_type=:discountType, value=:value, expiry_date=:expiryDate,
       minimum_purchase=:minimumPurchase, usage_limit=:usageLimit, active=:active WHERE code=:code`,
      payload
    );
  } else {
    await execute(
      `INSERT INTO coupons (id, code, discount_type, value, expiry_date, minimum_purchase, usage_limit, active)
       VALUES (:id, :code, :discountType, :value, :expiryDate, :minimumPurchase, :usageLimit, :active)`,
      { id: id(), ...payload }
    );
  }
  const coupon = mapCoupon(await row("SELECT * FROM coupons WHERE code = :code", { code }));
  res.json({ success: true, coupon });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  res.json({ success: true, coupons: (await rows("SELECT * FROM coupons ORDER BY created_at DESC")).map(mapCoupon) });
});

export const toggleCouponActive = asyncHandler(async (req, res) => {
  const active = toBoolean(req.body.active);
  await execute("UPDATE coupons SET active = :active WHERE id = :id", { id: req.params.id, active });
  const coupon = mapCoupon(await row("SELECT * FROM coupons WHERE id = :id", { id: req.params.id }));
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.json({ success: true, coupon });
});

export const upsertPage = asyncHandler(async (req, res) => {
  const existing = await row("SELECT * FROM pages WHERE slug = :slug", { slug: req.params.slug });
  if (existing) {
    await execute(
      "UPDATE pages SET title=:title, body=:body, seo_title=:seoTitle, seo_description=:seoDescription, published=:published WHERE slug=:slug",
      { slug: req.params.slug, ...req.body, published: req.body.published ?? true }
    );
  } else {
    await execute(
      "INSERT INTO pages (id, slug, title, body, seo_title, seo_description, published) VALUES (:id, :slug, :title, :body, :seoTitle, :seoDescription, :published)",
      { id: id(), slug: req.params.slug, ...req.body, published: req.body.published ?? true }
    );
  }
  const page = await row("SELECT * FROM pages WHERE slug = :slug", { slug: req.params.slug });
  res.json({ success: true, page });
});

export const getPage = asyncHandler(async (req, res) => {
  const page = await row("SELECT * FROM pages WHERE slug = :slug AND published = TRUE", { slug: req.params.slug });
  res.json({ success: true, page });
});

function normalizeCouponPayload(body: any) {
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new ApiError(400, "Coupon code must be 3-40 letters, numbers, hyphens, or underscores");

  const discountType = body.discountType === "flat" ? "flat" : body.discountType === "percentage" ? "percentage" : null;
  if (!discountType) throw new ApiError(400, "Discount type must be percentage or flat");

  const value = Number(body.value);
  const minimumPurchase = Number(body.minimumPurchase ?? 0);
  const usageLimit = Number(body.usageLimit ?? 1);
  const expiryDate = new Date(body.expiryDate);
  const active = body.active ?? true;

  if (!Number.isFinite(value) || value <= 0) throw new ApiError(400, "Coupon value must be greater than zero");
  if (discountType === "percentage" && value > 100) throw new ApiError(400, "Percentage coupon cannot be more than 100%");
  if (!Number.isFinite(minimumPurchase) || minimumPurchase < 0) throw new ApiError(400, "Minimum purchase cannot be negative");
  if (!Number.isInteger(usageLimit) || usageLimit < 1) throw new ApiError(400, "Usage limit must be at least 1");
  if (!Number.isFinite(expiryDate.getTime())) throw new ApiError(400, "Valid expiry date required");

  return {
    code,
    discountType,
    value,
    expiryDate,
    minimumPurchase,
    usageLimit,
    active: toBoolean(active)
  };
}

function mapCoupon(coupon: any) {
  if (!coupon) return null;
  return {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discount_type,
    value: Number(coupon.value),
    expiryDate: coupon.expiry_date,
    minimumPurchase: Number(coupon.minimum_purchase),
    usageLimit: Number(coupon.usage_limit),
    usedCount: Number(coupon.used_count),
    active: isActiveFlag(coupon.active),
    createdAt: coupon.created_at,
    updatedAt: coupon.updated_at
  };
}

function isActiveFlag(value: boolean | number | string) {
  return value === true || value === 1 || value === "1";
}

function toBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}
