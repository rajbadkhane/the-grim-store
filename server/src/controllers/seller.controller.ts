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
  const requests = await rows("SELECT * FROM seller_requests ORDER BY created_at DESC");
  res.json({ success: true, requests: requests.map(mapSellerRequest) });
});

export const updateSellerRequest = asyncHandler(async (req, res) => {
  const status = String(req.body.status ?? "").trim().toLowerCase();
  if (!statuses.has(status)) throw new ApiError(400, "Invalid seller request status");

  await execute(
    "UPDATE seller_requests SET status = :status, admin_note = :adminNote, updated_at = CURRENT_TIMESTAMP WHERE id = :id",
    { id: req.params.id, status, adminNote: String(req.body.adminNote ?? "") }
  );

  const sellerRequest = mapSellerRequest(await row("SELECT * FROM seller_requests WHERE id = :id", { id: req.params.id }));
  if (!sellerRequest) throw new ApiError(404, "Seller request not found");
  res.json({ success: true, request: sellerRequest });
});

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
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}
