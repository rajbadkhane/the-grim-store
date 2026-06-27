import { randomUUID } from "node:crypto";
import { sql as sqlClient } from "../config/db.js";

export type SqlUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "seller" | "admin";
  avatar: string;
  wishlist: string[];
  cart: any[];
  addresses: any[];
  emailVerified: boolean;
  refreshToken: string;
  passwordHash: string;
  isBlocked: boolean;
  lastLogin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function id() {
  return randomUUID();
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function json(value: unknown) {
  return JSON.stringify(value ?? null);
}

// Convert named parameters (:paramName) to positional ($1, $2, ...)
function convertNamedParamsToPositional(sqlStr: string, params: Record<string, unknown>) {
  let paramIndex = 1;
  const paramValues: unknown[] = [];
  const paramMap: Record<string, number> = {};

  // Find all named parameters in order of appearance
  const paramRegex = /(?<!:):(\w+)/g;
  let match;
  const paramNames = new Set<string>();
  
  while ((match = paramRegex.exec(sqlStr)) !== null) {
    const paramName = match[1];
    if (!paramNames.has(paramName)) {
      paramNames.add(paramName);
      paramMap[paramName] = paramIndex;
      paramValues.push(params[paramName] ?? null);
      paramIndex++;
    }
  }

  // Replace named parameters with positional ones
  let convertedSql = sqlStr;
  for (const [paramName, index] of Object.entries(paramMap)) {
    convertedSql = convertedSql.replace(new RegExp(`(?<!:):${paramName}\\b`, "g"), `$${index}`);
  }

  return { sql: convertedSql, values: paramValues };
}

export async function rows<T = any>(sqlStr: string, params: Record<string, unknown> = {}) {
  try {
    const { sql: convertedSql, values } = convertNamedParamsToPositional(sqlStr, params);
    const result = await sqlClient.unsafe(convertedSql, values as any);
    return result as unknown as T[];
  } catch (error) {
    console.error("[sql] Query error:", error, { sqlStr, params });
    throw error;
  }
}

export async function row<T = any>(sqlStr: string, params: Record<string, unknown> = {}) {
  const result = await rows<T>(sqlStr, params);
  return result[0] ?? null;
}

export async function execute(sqlStr: string, params: Record<string, unknown> = {}) {
  try {
    const { sql: convertedSql, values } = convertNamedParamsToPositional(sqlStr, params);
    const result = await sqlClient.unsafe(convertedSql, values as any);
    return { affectedRows: result.length > 0 ? 1 : 0 };
  } catch (error) {
    console.error("[sql] Execute error:", error, { sqlStr, params });
    throw error;
  }
}

export function mapUser(db: any): SqlUser | null {
  if (!db) return null;
  return {
    id: db.id,
    name: db.name ?? "",
    email: db.email,
    phone: db.phone ?? "",
    role: db.role,
    avatar: db.avatar ?? "",
    wishlist: parseJson<string[]>(db.wishlist, []),
    cart: parseJson<any[]>(db.cart, []),
    addresses: parseJson<any[]>(db.addresses, []),
    emailVerified: Boolean(db.email_verified),
    refreshToken: db.refresh_token ?? "",
    passwordHash: db.password_hash ?? "",
    isBlocked: Boolean(db.is_blocked),
    lastLogin: db.last_login ?? null,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function mapProduct(db: any) {
  if (!db) return null;
  const tags = parseJson<string[]>(db.tags, []);
  return {
    id: db.id,
    _id: db.id,
    title: db.title,
    slug: db.slug,
    description: db.description,
    shortDescription: db.short_description ?? "",
    brand: db.brand,
    category: db.category_id,
    subCategory: db.subcategory_id,
    gender: db.gender,
    tags,
    sellerId: db.seller_id ?? null,
    sellerName: db.seller_name ?? null,
    productStatus: db.product_status ?? "active",
    adminNote: db.admin_note ?? "",
    brandMeta: brandMetaFromTags(db.brand, tags),
    price: Number(db.price),
    salePrice: Number(db.sale_price),
    discountPercentage: Number(db.discount_percentage),
    stock: Number(db.stock),
    sku: db.sku,
    colors: parseJson<any[]>(db.colors, []),
    sizes: parseJson<any[]>(db.sizes, []),
    images: parseJson<any[]>(db.images, []),
    variants: parseJson<any[]>(db.variants, []),
    summary: parseJson<any[]>(db.summary, []),
    descriptionHtml: db.description_html ?? "",
    careInstructions: parseJson<any[]>(db.care_instructions, []),
    sizeChart: parseJson<any[]>(db.size_chart, []),
    deliveryInfo: parseJson<any>(db.delivery_info, {}),
    returnPolicy: db.return_policy ?? "",
    featured: Boolean(db.featured),
    trending: Boolean(db.trending),
    bestseller: Boolean(db.bestseller),
    ratings: {
      average: Number(db.rating_average),
      count: Number(db.rating_count),
      distribution: parseJson<Record<string, number>>(db.rating_distribution, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    },
    seoTitle: db.seo_title,
    seoDescription: db.seo_description,
    metaKeywords: parseJson<string[]>(db.meta_keywords, []),
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function mapSellerProfile(db: any) {
  if (!db) return null;
  return {
    id: db.id,
    userId: db.user_id,
    requestId: db.request_id,
    businessName: db.business_name,
    ownerName: db.owner_name,
    email: db.email,
    phone: db.phone,
    city: db.city,
    pincode: db.pincode,
    category: db.category,
    gstNumber: db.gst_number ?? "",
    website: db.website ?? "",
    status: db.status ?? "active",
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

function brandMetaFromTags(brand: string, tags: string[]) {
  const meta = { name: brand ?? "", logo: "" };
  for (const tag of tags) {
    const [rawKey, ...rawValue] = String(tag).split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (!value) continue;
    if (key === "brandname" || key === "brand-name" || key === "branddisplay") meta.name = value;
    if (key === "brandlogo" || key === "brand-logo" || key === "brandimage" || key === "brand-image") meta.logo = value;
  }
  return meta;
}

export function mapOrder(db: any) {
  if (!db) return null;
  return {
    id: db.id,
    _id: db.id,
    orderId: db.order_id,
    user: db.user_id,
    products: parseJson<any[]>(db.products, []),
    paymentInfo: parseJson<any>(db.payment_info, {}),
    shippingAddress: parseJson<any>(db.shipping_address, {}),
    orderStatus: db.order_status,
    trackingStatus: db.tracking_status,
    totalAmount: Number(db.total_amount),
    shippingFee: Number(db.shipping_fee),
    discountAmount: Number(db.discount_amount),
    deliveryDate: db.delivery_date,
    paymentStatus: db.payment_status,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function mapReview(db: any) {
  if (!db) return null;
  return {
    id: db.id,
    _id: db.id,
    userId: db.user_id,
    productId: db.product_id,
    orderId: db.order_db_id,
    userName: db.user_name,
    userAvatar: db.user_avatar,
    rating: Number(db.rating),
    title: db.title,
    comment: db.comment,
    images: parseJson<any[]>(db.images, []),
    verifiedPurchase: Boolean(db.verified_purchase),
    helpfulCount: Number(db.helpful_count),
    helpfulUsers: parseJson<string[]>(db.helpful_users, []),
    reported: Boolean(db.reported),
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export async function getUserById(userId: string) {
  return mapUser(await row("SELECT * FROM users WHERE id = :userId", { userId }));
}

export async function getUserByEmail(email: string) {
  return mapUser(await row("SELECT * FROM users WHERE email = :email", { email }));
}

export async function saveUserState(user: SqlUser) {
  await execute(
    `UPDATE users SET name = :name, phone = :phone, avatar = :avatar, wishlist = :wishlist, cart = :cart,
      addresses = :addresses, email_verified = :emailVerified, refresh_token = :refreshToken,
      password_hash = :passwordHash, is_blocked = :isBlocked, last_login = :lastLogin WHERE id = :id`,
    {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      wishlist: json(user.wishlist),
      cart: json(user.cart),
      addresses: json(user.addresses),
      emailVerified: user.emailVerified,
      refreshToken: user.refreshToken,
      passwordHash: user.passwordHash,
      isBlocked: user.isBlocked,
      lastLogin: user.lastLogin
    }
  );
}

export function publicUser(user: SqlUser) {
  const { refreshToken, passwordHash, ...safe } = user;
  void refreshToken;
  void passwordHash;
  return safe;
}
