import { Router } from "express";
import { addAddress, addToCart, deleteAddress, listAddresses, listWishlistProducts, removeCartItem, toggleWishlist, updateAddress, updateCartItem, updateProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addAddressSchema } from "../validators/order.validator.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.patch("/profile", updateProfile);
userRoutes.post("/addresses", validate(addAddressSchema), addAddress);
userRoutes.get("/addresses", listAddresses);
userRoutes.patch("/addresses/:id", updateAddress);
userRoutes.delete("/addresses/:id", deleteAddress);
userRoutes.post("/wishlist/:productId", toggleWishlist);
userRoutes.get("/wishlist-products", listWishlistProducts);
userRoutes.post("/cart", addToCart);
userRoutes.patch("/cart/:itemId", updateCartItem);
userRoutes.delete("/cart/:itemId", removeCartItem);
