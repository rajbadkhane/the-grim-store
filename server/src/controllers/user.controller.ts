import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { execute, mapProduct, mapUser, row, rows, saveUserState, publicUser } from "../lib/sql.js";
import { randomUUID } from "node:crypto";

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = (({ name, phone, avatar }) => ({ name, phone, avatar }))(req.body);
  Object.assign(req.user!, updates);
  await saveUserState(req.user!);
  res.json({ success: true, user: publicUser(req.user!) });
});

export const addAddress = asyncHandler(async (req, res) => {
  const address = { id: randomUUID(), ...req.body };
  if (address.isDefault) req.user!.addresses.forEach((item: any) => (item.isDefault = false));
  req.user!.addresses.push(address);
  await saveUserState(req.user!);
  res.status(201).json({ success: true, addresses: req.user!.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = req.user!.addresses.find((item: any) => item.id === String(req.params.id));
  if (!address) throw new ApiError(404, "Address not found");
  if (req.body.isDefault) req.user!.addresses.forEach((item: any) => (item.isDefault = false));
  Object.assign(address, req.body);
  await saveUserState(req.user!);
  res.json({ success: true, addresses: req.user!.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  req.user!.addresses = req.user!.addresses.filter((item: any) => item.id !== String(req.params.id));
  await saveUserState(req.user!);
  res.json({ success: true, addresses: req.user!.addresses });
});

export const listAddresses = asyncHandler(async (req, res) => {
  res.json({ success: true, addresses: req.user!.addresses });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const productId = String(req.params.productId);
  const exists = req.user!.wishlist.some((id) => id === productId);
  if (exists) req.user!.wishlist = req.user!.wishlist.filter((id) => id !== productId);
  else req.user!.wishlist.push(productId);
  await saveUserState(req.user!);
  res.json({ success: true, wishlist: req.user!.wishlist });
});

export const listWishlistProducts = asyncHandler(async (req, res) => {
  const ids: string[] = Array.isArray(req.user!.wishlist) ? req.user!.wishlist.map(String) : [];
  if (!ids.length) return res.json({ success: true, products: [] });

  const placeholders = ids.map((_, i) => `:id${i}`).join(", ");
  const params = ids.reduce((acc, id, i) => ({ ...acc, [`id${i}`]: id }), {});
  const dbProducts = await rows(`SELECT * FROM products WHERE id IN (${placeholders}) AND product_status = 'active'`, params);

  const products = dbProducts.map(mapProduct).filter(Boolean);
  res.json({ success: true, products });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;
  const product = mapProduct(await row("SELECT * FROM products WHERE id = :productId AND product_status = 'active'", { productId }));
  if (!product) throw new ApiError(404, "Product not found");
  const existing = req.user!.cart.find((item: any) => item.product === productId && item.size === size && item.color === color);
  if (existing) existing.quantity += quantity;
  else req.user!.cart.push({ id: randomUUID(), product: product.id, title: product.title, image: product.images[0]?.url, price: product.price, salePrice: product.salePrice, size, color, quantity });
  await saveUserState(req.user!);
  res.json({ success: true, cart: req.user!.cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const item = req.user!.cart.find((entry: any) => entry.id === String(req.params.itemId));
  if (!item) throw new ApiError(404, "Cart item not found");
  item.quantity = req.body.quantity;
  await saveUserState(req.user!);
  res.json({ success: true, cart: req.user!.cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  req.user!.cart = req.user!.cart.filter((entry: any) => entry.id !== String(req.params.itemId));
  await saveUserState(req.user!);
  res.json({ success: true, cart: req.user!.cart });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = (await rows("SELECT * FROM users ORDER BY created_at DESC")).map(mapUser).filter(Boolean);
  const enriched = await Promise.all(
    users.map(async (user) => {
      const stats = await row<{ orderCount: number; totalSpent: number; lastOrderAt: string | null }>(
        `SELECT COUNT(*) AS orderCount, COALESCE(SUM(total_amount), 0) AS totalSpent, MAX(created_at) AS lastOrderAt
         FROM orders WHERE user_id = :userId`,
        { userId: user!.id }
      );
      return {
        ...publicUser(user!),
        stats: {
          orderCount: Number(stats?.orderCount ?? 0),
          totalSpent: Number(stats?.totalSpent ?? 0),
          lastOrderAt: stats?.lastOrderAt ?? null,
          addressCount: user!.addresses.length,
          wishlistCount: user!.wishlist.length,
          cartCount: user!.cart.length
        }
      };
    })
  );
  res.json({ success: true, users: enriched });
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = mapUser(await row("SELECT * FROM users WHERE id = :id", { id: req.params.id }));
  if (!user) throw new ApiError(404, "User not found");
  user.isBlocked = !user.isBlocked;
  await saveUserState(user);
  res.json({ success: true, user: publicUser(user) });
});
