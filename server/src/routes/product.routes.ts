import { Router } from "express";
import {
  createCategory,
  createProduct,
  createSubCategory,
  deleteCategory,
  deleteProduct,
  deleteSubCategory,
  getProduct,
  listAllProductsForAdmin,
  listCategories,
  listProductSuggestions,
  listProducts,
  listSubCategories,
  moderateProduct,
  updateCategory,
  updateProduct,
  updateSubCategory
} from "../controllers/product.controller.js";
import { bulkImportProducts, getImportTemplate } from "../controllers/bulk-import.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { excelUpload } from "../middlewares/excel-upload.js";
import { validate } from "../middlewares/validate.js";
import { productQuerySchema, productSchema, productSuggestionQuerySchema } from "../validators/product.validator.js";

export const productRoutes = Router();

productRoutes.get("/", validate(productQuerySchema), listProducts);
productRoutes.get("/categories", listCategories);
productRoutes.get("/suggestions", validate(productSuggestionQuerySchema), listProductSuggestions);
productRoutes.get("/admin/all", requireAuth, requireAdmin, listAllProductsForAdmin);
productRoutes.get("/bulk-import/template", requireAuth, requireAdmin, getImportTemplate);
productRoutes.post("/bulk-import", requireAuth, requireAdmin, excelUpload.single("file"), bulkImportProducts);
productRoutes.get("/subcategories", listSubCategories);
productRoutes.get("/:slug", getProduct);
productRoutes.post("/", requireAuth, requireAdmin, validate(productSchema), createProduct);
productRoutes.patch("/:id/moderation", requireAuth, requireAdmin, moderateProduct);
productRoutes.patch("/:id", requireAuth, requireAdmin, updateProduct);
productRoutes.delete("/:id", requireAuth, requireAdmin, deleteProduct);
productRoutes.post("/categories", requireAuth, requireAdmin, createCategory);
productRoutes.patch("/categories/:id", requireAuth, requireAdmin, updateCategory);
productRoutes.delete("/categories/:id", requireAuth, requireAdmin, deleteCategory);
productRoutes.post("/subcategories", requireAuth, requireAdmin, createSubCategory);
productRoutes.patch("/subcategories/:id", requireAuth, requireAdmin, updateSubCategory);
productRoutes.delete("/subcategories/:id", requireAuth, requireAdmin, deleteSubCategory);
