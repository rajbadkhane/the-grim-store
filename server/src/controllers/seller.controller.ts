import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { execute, id, row, rows } from "../lib/sql.js";

const statuses = new Set(["pending", "reviewing", "approved", "rejected"]);

export const createSellerRequest = asyncHandler(async (req, res) => {
  const payload = normalizeSellerRequest(req.body);
  const requestId = id();
  await execute(
    `INSERT INTO seller_requests (
      id, business_name, owner_name, email, phone, city, pincode, category,
      product_count, monthly_sales, gst_number, website, message
    ) VALUES (
      :id, :businessName, :ownerName, :email, :phone, :city, :pincode, :category,
      :productCount, :monthlySales, :gstNumber, :website, :message
    )`,
    { id: requestId, ...payload }
  );

  const sellerRequest = mapSellerRequest(await row("SELECT * FROM seller_requests WHERE id = :id", { id: requestId }));
  res.status(201).json({ success: true, message: "Your request submitted", request: sellerRequest });
});

export const listSellerRequests = asyncHandler(async (_req, res) => {
  const requests = await rows(`
    SELECT seller_requests.*, users.password_hash AS seller_password_hash
    FROM seller_requests
    LEFT JOIN users ON users.id = seller_requests.seller_user_id OR LOWER(users.email) = LOWER(seller_requests.email)
    ORDER BY seller_requests.created_at DESC
  `);
  res.json({ success: true, requests: requests.map(mapSellerRequest) });
});

export const updateSellerRequest = asyncHandler(async (req, res) => {
  const status = String(req.body.status ?? "").trim().toLowerCase();
  if (!statuses.has(status)) throw new ApiError(400, "Invalid seller request status");

  const current = await row("SELECT * FROM seller_requests WHERE id = :id", { id: req.params.id });
  if (!current) throw new ApiError(404, "Seller request not found");
  let linked = null;
  if (status === "approved") {
    linked = await ensureApprovedSeller(current);
  }

  await execute(
    `UPDATE seller_requests SET status = :status, admin_note = :adminNote,
      seller_user_id = COALESCE(:sellerUserId, seller_user_id),
      seller_profile_id = COALESCE(:sellerProfileId, seller_profile_id),
      updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
    {
      id: req.params.id,
      status,
      adminNote: String(req.body.adminNote ?? ""),
      sellerUserId: linked?.userId ?? null,
      sellerProfileId: linked?.profileId ?? null
    }
  );

  const sellerRequest = mapSellerRequest(await row("SELECT * FROM seller_requests WHERE id = :id", { id: req.params.id }));
  if (!sellerRequest) throw new ApiError(404, "Seller request not found");
  res.json({ success: true, request: sellerRequest });
});

export const setSellerCredentials = asyncHandler(async (req, res) => {
  const current = await row("SELECT * FROM seller_requests WHERE id = :id", { id: req.params.id });
  if (!current) throw new ApiError(404, "Seller request not found");

  const plainPassword = normalizePassword(req.body.password) || generateSellerPassword();
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const linked = await ensureApprovedSeller(current, passwordHash);

  await execute(
    `UPDATE seller_requests SET status = 'approved', admin_note = :adminNote,
      seller_user_id = :sellerUserId,
      seller_profile_id = :sellerProfileId,
      updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
    {
      id: req.params.id,
      adminNote: String(req.body.adminNote ?? current.admin_note ?? ""),
      sellerUserId: linked.userId,
      sellerProfileId: linked.profileId
    }
  );

  const sellerRequest = mapSellerRequest(
    await row(
      `SELECT seller_requests.*, users.password_hash AS seller_password_hash
       FROM seller_requests LEFT JOIN users ON users.id = seller_requests.seller_user_id
       WHERE seller_requests.id = :id`,
      { id: req.params.id }
    )
  );
  res.json({ success: true, request: sellerRequest, credentials: { email: String(current.email).toLowerCase(), password: plainPassword } });
});

export const createSellerAccount = asyncHandler(async (req, res) => {
  const payload = normalizeSellerRequest(req.body);
  const plainPassword = normalizePassword(req.body.password) || generateSellerPassword();
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const existing = await row("SELECT * FROM seller_requests WHERE LOWER(email) = LOWER(:email) ORDER BY created_at DESC LIMIT 1", { email: payload.email });
  const requestId = existing?.id ?? id();

  if (existing) {
    await execute(
      `UPDATE seller_requests SET business_name = :businessName, owner_name = :ownerName, email = :email, phone = :phone,
        city = :city, pincode = :pincode, category = :category, product_count = :productCount, monthly_sales = :monthlySales,
        gst_number = :gstNumber, website = :website, message = :message, status = 'approved', updated_at = CURRENT_TIMESTAMP
       WHERE id = :id`,
      { id: requestId, ...payload }
    );
  } else {
    await execute(
      `INSERT INTO seller_requests (
        id, business_name, owner_name, email, phone, city, pincode, category,
        product_count, monthly_sales, gst_number, website, message, status
      ) VALUES (
        :id, :businessName, :ownerName, :email, :phone, :city, :pincode, :category,
        :productCount, :monthlySales, :gstNumber, :website, :message, 'approved'
      )`,
      { id: requestId, ...payload }
    );
  }

  const current = await row("SELECT * FROM seller_requests WHERE id = :id", { id: requestId });
  const linked = await ensureApprovedSeller(current, passwordHash);
  await execute(
    `UPDATE seller_requests SET seller_user_id = :sellerUserId, seller_profile_id = :sellerProfileId, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
    { id: requestId, sellerUserId: linked.userId, sellerProfileId: linked.profileId }
  );

  const sellerRequest = mapSellerRequest(
    await row(
      `SELECT seller_requests.*, users.password_hash AS seller_password_hash
       FROM seller_requests LEFT JOIN users ON users.id = seller_requests.seller_user_id
       WHERE seller_requests.id = :id`,
      { id: requestId }
    )
  );
  res.status(201).json({ success: true, request: sellerRequest, credentials: { email: payload.email, password: plainPassword } });
});

async function ensureApprovedSeller(request: any, passwordHash?: string) {
  const email = String(request.email ?? "").trim().toLowerCase();
  if (!email) throw new ApiError(400, "Seller request has no email");

  let user = await row("SELECT * FROM users WHERE email = :email", { email });
  const sellerUserId = user?.id ?? id();
  if (!user) {
    await execute(
      `INSERT INTO users (id, name, email, phone, role, email_verified, password_hash, is_blocked)
       VALUES (:id, :name, :email, :phone, 'seller', TRUE, :passwordHash, FALSE)`,
      {
        id: sellerUserId,
        name: request.owner_name ?? request.business_name,
        email,
        phone: request.phone ?? "",
        passwordHash: passwordHash ?? null
      }
    );
  } else if (user.role !== "admin") {
    await execute(
      `UPDATE users SET role = 'seller',
        phone = COALESCE(NULLIF(phone, ''), :phone),
        password_hash = COALESCE(:passwordHash, password_hash),
        email_verified = TRUE,
        is_blocked = FALSE,
        updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
      {
        id: sellerUserId,
        phone: request.phone ?? "",
        passwordHash: passwordHash ?? null
      }
    );
  }

  const existingProfile = await row("SELECT * FROM seller_profiles WHERE email = :email OR user_id = :userId", { email, userId: sellerUserId });
  const profileId = existingProfile?.id ?? id();
  if (existingProfile) {
    await execute(
      `UPDATE seller_profiles SET request_id = :requestId, business_name = :businessName, owner_name = :ownerName,
        phone = :phone, city = :city, pincode = :pincode, category = :category, gst_number = :gstNumber,
        website = :website, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
      {
        id: profileId,
        requestId: request.id,
        businessName: request.business_name,
        ownerName: request.owner_name,
        phone: request.phone,
        city: request.city,
        pincode: request.pincode,
        category: request.category,
        gstNumber: request.gst_number ?? "",
        website: request.website ?? ""
      }
    );
  } else {
    await execute(
      `INSERT INTO seller_profiles (
        id, user_id, request_id, business_name, owner_name, email, phone, city, pincode, category, gst_number, website, status
      ) VALUES (
        :id, :userId, :requestId, :businessName, :ownerName, :email, :phone, :city, :pincode, :category, :gstNumber, :website, 'active'
      )`,
      {
        id: profileId,
        userId: sellerUserId,
        requestId: request.id,
        businessName: request.business_name,
        ownerName: request.owner_name,
        email,
        phone: request.phone,
        city: request.city,
        pincode: request.pincode,
        category: request.category,
        gstNumber: request.gst_number ?? "",
        website: request.website ?? ""
      }
    );
  }

  return { userId: sellerUserId, profileId };
}

function normalizeSellerRequest(body: any) {
  const payload = {
    businessName: clean(body.businessName),
    ownerName: clean(body.ownerName),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    city: clean(body.city),
    pincode: clean(body.pincode),
    category: clean(body.category),
    productCount: clean(body.productCount),
    monthlySales: clean(body.monthlySales),
    gstNumber: clean(body.gstNumber),
    website: clean(body.website),
    message: clean(body.message)
  };

  for (const key of ["businessName", "ownerName", "email", "phone", "city", "pincode", "category"] as const) {
    if (!payload[key]) throw new ApiError(400, `${key} is required`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new ApiError(400, "Valid email is required");
  if (!/^[0-9]{6}$/.test(payload.pincode)) throw new ApiError(400, "Valid 6 digit pincode is required");
  if (!/^[0-9+\-\s]{8,18}$/.test(payload.phone)) throw new ApiError(400, "Valid phone number is required");

  return payload;
}

function clean(value: unknown) {
  return String(value ?? "").trim().slice(0, 500);
}

function normalizePassword(value: unknown) {
  const password = String(value ?? "").trim();
  if (!password) return "";
  if (password.length < 8) throw new ApiError(400, "Seller password must be at least 8 characters");
  return password;
}

function generateSellerPassword() {
  return `Seller-${randomBytes(6).toString("hex")}`;
}

function mapSellerRequest(item: any) {
  if (!item) return null;
  return {
    id: item.id,
    businessName: item.business_name,
    ownerName: item.owner_name,
    email: item.email,
    phone: item.phone,
    city: item.city,
    pincode: item.pincode,
    category: item.category,
    productCount: item.product_count,
    monthlySales: item.monthly_sales,
    gstNumber: item.gst_number,
    website: item.website,
    message: item.message,
    status: item.status,
    adminNote: item.admin_note,
    sellerUserId: item.seller_user_id ?? null,
    sellerProfileId: item.seller_profile_id ?? null,
    sellerHasCredentials: Boolean(item.seller_password_hash),
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}
