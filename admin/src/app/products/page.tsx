"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Edit3, FileSpreadsheet, ImagePlus, Loader2, PackagePlus, Plus, Search, Trash2, Upload, X, XCircle } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  sku: string;
  stock: number;
  price: number;
  salePrice: number;
  images: { url: string; alt: string }[];
  category?: string;
  gender?: string;
  tags?: string[];
  shortDescription?: string;
  description?: string;
  descriptionHtml?: string;
  summary?: Array<{ title?: string; text: string; icon?: string }>;
  colors?: Array<{ name: string; hex: string }>;
  sizes?: Array<{ label: string; stock: number }>;
  variants?: Array<Record<string, any>>;
  careInstructions?: string[];
  sizeChart?: Record<string, string>[];
  deliveryInfo?: Record<string, any>;
  returnPolicy?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  featured: boolean;
  trending: boolean;
  bestseller: boolean;
  sellerId?: string | null;
  sellerName?: string | null;
  productStatus?: "draft" | "pending_review" | "active" | "rejected" | "inactive";
  adminNote?: string;
};

type VariantDraft = {
  color: string;
  colorHex: string;
  size: string;
  material: string;
  pattern: string;
  sku: string;
  stock: string;
  price: string;
  salePrice: string;
  imageUrls: string;
  available: boolean;
};

const initialForm = {
  title: "",
  brand: "Grim Originals",
  sku: "",
  category: "",
  gender: "unisex",
  price: "",
  salePrice: "",
  stock: "",
  shortDescription: "",
  description: "",
  summary: "Premium cotton fabric\nOversized streetwear fit\nBio-washed finish",
  seoTitle: "",
  seoDescription: "",
  deliveryText: "Free delivery above INR 1499. Standard delivery usually takes 3-6 business days.",
  returnPolicy: "Easy 7-day exchange for size issues on unused products with original tags.",
  tags: "",
  featured: false,
  trending: false,
  bestseller: false
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [ownership, setOwnership] = useState<"all" | "admin" | "seller">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      await api.get("/auth/me");
      const [productRes, categoryRes] = await Promise.all([api.get("/products/admin/all?limit=500"), api.get("/products/categories")]);
      setProducts(productRes.data.items ?? []);
      setCategories(categoryRes.data.categories ?? []);
    } catch (error: any) {
      if (error.response?.status === 401) router.push("/login");
      else toast.error(error.response?.data?.message ?? "Unable to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return products.filter((product) => {
      const matchesText = [product.title, product.brand, product.sku, product.sellerName, product.productStatus].join(" ").toLowerCase().includes(value);
      const matchesOwnership = ownership === "all" || (ownership === "admin" ? !product.sellerId : Boolean(product.sellerId));
      const matchesStatus = statusFilter === "all" || product.productStatus === statusFilter;
      return matchesText && matchesOwnership && matchesStatus;
    });
  }, [products, query, ownership, statusFilter]);

  function addProduct() {
    setEditingProduct(null);
    setOpen(true);
  }

  function editProduct(product: Product) {
    setEditingProduct(product);
    setOpen(true);
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete product "${product.title}"?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success("Product deleted");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to delete product");
    }
  }

  async function moderateProduct(product: Product, status: "active" | "rejected" | "inactive" | "pending_review") {
    const adminNote = status === "rejected" ? window.prompt("Reason for rejection?", product.adminNote ?? "") ?? "" : product.adminNote ?? "";
    try {
      await api.patch(`/products/${product.id}/moderation`, { status, adminNote });
      toast.success(status === "active" ? "Product approved" : "Product status updated");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to update product status");
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Inventory</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Products</h2>
          <p className="mt-1 text-sm text-slate-500">Create, upload images, and manage products from one clean screen.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <FileSpreadsheet size={18} /> Import Excel
          </button>
          <button onClick={addProduct} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-indigo-500">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <section className="mt-6 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full max-w-md items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="ml-2 w-full bg-transparent text-sm text-slate-800" />
          </label>
          <div className="flex flex-wrap gap-2">
            <select value={ownership} onChange={(event) => setOwnership(event.target.value as any)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
              <option value="all">All ownership</option>
              <option value="admin">Admin-owned</option>
              <option value="seller">Seller products</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
              <option value="all">All status</option>
              <option value="pending_review">Pending review</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <span className="text-sm font-bold text-slate-500">{filtered.length} products</span>
        </div>

        <div className="grid min-w-0 max-w-full gap-3 md:hidden">
          {loading && (
            <div className="py-10 text-center text-slate-500">
              <Loader2 className="mx-auto mb-2 animate-spin" /> Loading products
            </div>
          )}
          {!loading && filtered.map((product) => (
            <ProductMobileCard key={product.id} product={product} onEdit={editProduct} onDelete={deleteProduct} onModerate={moderateProduct} />
          ))}
          {!loading && filtered.length === 0 && <p className="py-10 text-center text-slate-500">No products found.</p>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3">Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Sale</th>
                <th>Seller</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 animate-spin" /> Loading products
                  </td>
                </tr>
              )}
              {!loading && filtered.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.title} className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200" />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-xs font-black text-slate-400 ring-1 ring-slate-200">IMG</div>
                      )}
                      <div>
                        <p className="font-black text-slate-900">{product.title}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold text-slate-600">{product.sku}</td>
                  <td className="text-slate-600">{product.stock}</td>
                  <td className="text-slate-500">{money(product.price)}</td>
                  <td className="font-black text-slate-900">{money(product.salePrice)}</td>
                  <td className="text-sm font-bold text-slate-600">{product.sellerName || "The Grim Store"}</td>
                  <td>
                    <StatusPill product={product} />
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      {product.productStatus === "pending_review" && (
                        <>
                          <button onClick={() => moderateProduct(product, "active")} aria-label={`Approve ${product.title}`} className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50">
                            <Check size={17} />
                          </button>
                          <button onClick={() => moderateProduct(product, "rejected")} aria-label={`Reject ${product.title}`} className="rounded-xl p-2 text-red-600 hover:bg-red-50">
                            <XCircle size={17} />
                          </button>
                        </>
                      )}
                      <button onClick={() => editProduct(product)} aria-label={`Edit ${product.title}`} className="rounded-xl p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700">
                        <Edit3 size={17} />
                      </button>
                      <button onClick={() => deleteProduct(product)} aria-label={`Delete ${product.title}`} className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && <ProductModal product={editingProduct} categories={categories} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); setEditingProduct(null); load(); }} />}
      {importOpen && <BulkImportModal onClose={() => setImportOpen(false)} onImported={() => { setImportOpen(false); load(); }} />}
    </div>
  );
}

function ProductMobileCard({
  product,
  onEdit,
  onDelete,
  onModerate
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onModerate: (product: Product, status: "active" | "rejected" | "inactive" | "pending_review") => void;
}) {
  return (
    <article className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex min-w-0 gap-3">
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.title} className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200" />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-xs font-black text-slate-400 ring-1 ring-slate-200">IMG</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-slate-950">{product.title}</p>
          <p className="mt-1 truncate text-xs font-bold text-slate-500">{product.brand}</p>
          <p className="mt-1 truncate text-xs font-bold text-indigo-600">Seller: {product.sellerName || "The Grim Store"}</p>
          <p className="mt-1 truncate text-xs font-bold text-slate-500">SKU: {product.sku || "Not set"}</p>
        </div>
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-3 gap-2 text-sm">
        <MobileMetric label="Stock" value={product.stock} />
        <MobileMetric label="MRP" value={money(product.price)} />
        <MobileMetric label="Sale" value={money(product.salePrice)} />
      </div>
      <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
        <StatusPill product={product} />
        <div className="flex shrink-0 gap-1">
          {product.productStatus === "pending_review" && (
            <>
              <button onClick={() => onModerate(product, "active")} aria-label={`Approve ${product.title}`} className="rounded-xl bg-white p-2 text-emerald-600 ring-1 ring-slate-200 hover:bg-emerald-50">
                <Check size={17} />
              </button>
              <button onClick={() => onModerate(product, "rejected")} aria-label={`Reject ${product.title}`} className="rounded-xl bg-white p-2 text-red-600 ring-1 ring-slate-200 hover:bg-red-50">
                <XCircle size={17} />
              </button>
            </>
          )}
          <button onClick={() => onEdit(product)} aria-label={`Edit ${product.title}`} className="rounded-xl bg-white p-2 text-slate-500 ring-1 ring-slate-200 hover:text-indigo-700">
            <Edit3 size={17} />
          </button>
          <button onClick={() => onDelete(product)} aria-label={`Delete ${product.title}`} className="rounded-xl bg-white p-2 text-slate-500 ring-1 ring-slate-200 hover:text-red-600">
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusPill({ product }: { product: Product }) {
  const status = product.productStatus ?? "active";
  const statusClass: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    pending_review: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
    inactive: "bg-slate-100 text-slate-600",
    draft: "bg-slate-100 text-slate-600"
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass[status] ?? statusClass.active}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function MobileMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-slate-900">{value}</p>
    </div>
  );
}

function imageUrl(image: any) {
  return typeof image === "string" ? image : image?.url ?? "";
}

function normalizeImages(images: any[] | undefined, fallbackAlt: string) {
  return (Array.isArray(images) ? images : [])
    .map((image) => {
      const url = imageUrl(image);
      if (!url) return null;
      return {
        url,
        alt: typeof image === "string" ? fallbackAlt : image.alt || fallbackAlt,
        publicId: typeof image === "string" ? undefined : image.publicId
      };
    })
    .filter(Boolean) as { url: string; alt: string; publicId?: string }[];
}

function variantImageUrls(images: any[] | undefined) {
  return (Array.isArray(images) ? images : []).map(imageUrl).filter(Boolean).join(", ");
}

function productToForm(product: Product | null, categories: Category[]) {
  if (!product) return { ...initialForm, category: categories[0]?.id ?? "" };
  return {
    ...initialForm,
    title: product.title ?? "",
    brand: product.brand ?? "Grim Originals",
    sku: product.sku ?? "",
    category: product.category ?? categories[0]?.id ?? "",
    gender: product.gender ?? "unisex",
    price: String(product.price ?? ""),
    salePrice: String(product.salePrice ?? ""),
    stock: String(product.stock ?? ""),
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    summary: Array.isArray(product.summary) ? product.summary.map((item) => item.text ?? "").filter(Boolean).join("\n") : initialForm.summary,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    deliveryText: String(product.deliveryInfo?.text ?? initialForm.deliveryText),
    returnPolicy: product.returnPolicy ?? initialForm.returnPolicy,
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    featured: Boolean(product.featured),
    trending: Boolean(product.trending),
    bestseller: Boolean(product.bestseller)
  };
}

function productToVariants(product: Product | null): VariantDraft[] {
  if (product?.variants?.length) {
    return product.variants.map((variant) => ({
      color: String(variant.color ?? "Black"),
      colorHex: String(variant.colorHex ?? variant.hex ?? "#111111"),
      size: String(variant.size ?? "M"),
      material: String(variant.material ?? "Premium cotton"),
      pattern: String(variant.pattern ?? "Solid"),
      sku: String(variant.sku ?? ""),
      stock: String(variant.stock ?? product.stock ?? ""),
      price: String(variant.price ?? product.price ?? ""),
      salePrice: String(variant.salePrice ?? product.salePrice ?? ""),
      imageUrls: variantImageUrls(variant.images),
      available: variant.available !== false
    }));
  }

  return [
    {
      color: "Black",
      colorHex: "#111111",
      size: "M",
      material: "Premium cotton",
      pattern: "Solid",
      sku: "",
      stock: product ? String(product.stock ?? "") : "",
      price: product ? String(product.price ?? "") : "",
      salePrice: product ? String(product.salePrice ?? "") : "",
      imageUrls: variantImageUrls(product?.images),
      available: true
    }
  ];
}

function ProductModal({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() => productToForm(product, categories));
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(() => normalizeImages(product?.images, product?.title ?? "Product image"));
  const [variants, setVariants] = useState<VariantDraft[]>(() => productToVariants(product));
  const [descriptionHtml, setDescriptionHtml] = useState(product?.descriptionHtml ?? "");
  const [saving, setSaving] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);

  function update(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateVariant(index: number, name: keyof VariantDraft, value: string | boolean) {
    setVariants((current) => current.map((variant, variantIndex) => (variantIndex === index ? { ...variant, [name]: value } : variant)));
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        color: current[0]?.color ?? "Black",
        colorHex: current[0]?.colorHex ?? "#111111",
        size: "L",
        material: current[0]?.material ?? "Premium cotton",
        pattern: current[0]?.pattern ?? "Solid",
        sku: "",
        stock: "",
        price: form.price,
        salePrice: form.salePrice,
        imageUrls: "",
        available: true
      }
    ]);
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
  }

  async function save() {
    if (!form.title || !form.sku || !form.category || !form.price || !form.salePrice || !form.stock) {
      toast.error("Fill all required fields");
      return;
    }
    const variantDrafts = variants.filter((variant) => variant.color.trim() && variant.size.trim());
    if (!variantDrafts.length) {
      toast.error("Add at least one variant with color and size");
      return;
    }
    setSaving(true);
    try {
      let uploadedImages: { url: string; alt: string; publicId?: string }[] = [];
      if (files.length) {
        const body = new FormData();
        files.forEach((file) => body.append("images", file));
        const { data } = await api.post("/uploads/images", body, { headers: { "Content-Type": "multipart/form-data" } });
        uploadedImages = data.images ?? [];
      }
      const images = [...existingImages, ...uploadedImages];

      const variantPayload = variantDrafts.map((variant, index) => ({
        color: variant.color,
        colorHex: variant.colorHex,
        size: variant.size,
        material: variant.material,
        pattern: variant.pattern,
        sku: variant.sku || `${form.sku}-${variant.color}-${variant.size}-${index + 1}`.replace(/\s+/g, "-").toUpperCase(),
        stock: Number(variant.stock || form.stock),
        price: Number(variant.price || form.price),
        salePrice: Number(variant.salePrice || form.salePrice),
        images: (variant.imageUrls ? variant.imageUrls.split(",").map((url) => url.trim()).filter(Boolean) : images.map((image) => image.url)).map((url) => ({
          url,
          alt: `${form.title} ${variant.color} ${variant.size}`
        })),
        available: variant.available
      }));

      const payload = {
        title: form.title,
        brand: form.brand,
        sku: form.sku,
        category: form.category,
        gender: form.gender,
        price: Number(form.price),
        salePrice: Number(form.salePrice),
        stock: Number(form.stock),
        shortDescription: form.shortDescription || form.title,
        description: form.description || `${form.title} is a premium ecommerce product with clean finish, quality fabric, and modern fit.`,
        descriptionHtml: descriptionHtml === "<p></p>" ? "" : descriptionHtml,
        summary: form.summary.split("\n").map((text) => text.trim()).filter(Boolean).map((text) => ({ text })),
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        colors: Array.from(new Map(variantPayload.map((variant) => [variant.color, { name: variant.color, hex: variant.colorHex || "#111111" }])).values()),
        sizes: Array.from(new Map(variantPayload.map((variant) => [variant.size, { label: variant.size, stock: variant.stock }])).values()),
        images,
        variants: variantPayload,
        careInstructions: ["Machine wash cold", "Do not bleach", "Dry inside out"],
        sizeChart: [
          { Size: "S", Chest: "38 in", Length: "27 in" },
          { Size: "M", Chest: "40 in", Length: "28 in" },
          { Size: "L", Chest: "42 in", Length: "29 in" },
          { Size: "XL", Chest: "44 in", Length: "30 in" }
        ],
        deliveryInfo: { text: form.deliveryText },
        returnPolicy: form.returnPolicy,
        featured: form.featured,
        trending: form.trending,
        bestseller: form.bestseller,
        seoTitle: form.seoTitle || form.title,
        seoDescription: form.seoDescription || form.shortDescription || form.description || form.title,
        metaKeywords: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      };

      if (product) await api.patch(`/products/${product.id}`, payload);
      else await api.post("/products", payload);

      toast.success(product ? "Product updated" : "Product created");
      onSaved();
    } catch (error: any) {
      const fieldErrors = error.response?.data?.errors?.fieldErrors;
      const firstError = fieldErrors ? Object.entries(fieldErrors)[0] : null;
      toast.error(firstError ? `${firstError[0]}: ${(firstError[1] as string[])[0]}` : error.response?.data?.message ?? "Unable to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/45 p-0 sm:place-items-center sm:p-4">
      <div className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h3 className="text-xl font-black text-slate-950">{isEditing ? "Edit Product" : "Add Product"}</h3>
            <p className="text-sm text-slate-500">{isEditing ? "Update details, variants, and product images." : "Upload multiple images and publish to the SQL database."}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X />
          </button>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product title" required value={form.title} onChange={(value) => update("title", value)} />
            <Field label="SKU" required value={form.sku} onChange={(value) => update("sku", value)} />
            <Field label="Brand" required value={form.brand} onChange={(value) => update("brand", value)} />
            <label className="text-sm font-bold text-slate-700">
              Category <span className="text-red-500">*</span>
              <select value={form.category} onChange={(event) => update("category", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900">
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <Field label="MRP" required type="number" value={form.price} onChange={(value) => update("price", value)} />
            <Field label="Sale price" required type="number" value={form.salePrice} onChange={(value) => update("salePrice", value)} />
            <Field label="Stock" required type="number" value={form.stock} onChange={(value) => update("stock", value)} />
            <label className="text-sm font-bold text-slate-700">
              Gender
              <select value={form.gender} onChange={(event) => update("gender", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900">
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
            </label>
            <Field label="Short description" value={form.shortDescription} onChange={(value) => update("shortDescription", value)} className="sm:col-span-2" />
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">
              Description
              <textarea value={form.description} onChange={(event) => update("description", event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900" />
            </label>
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">
              Premium summary bullets
              <textarea
                value={form.summary}
                onChange={(event) => update("summary", event.target.value)}
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                placeholder="One summary point per line"
              />
            </label>
            <div className="sm:col-span-2">
              <p className="text-sm font-bold text-slate-700">Rich product description</p>
              <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-900">Variants</p>
                  <p className="text-xs font-bold text-slate-500">Set color, size, material, pattern, SKU, stock, pricing, and optional variant image URLs.</p>
                </div>
                <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">
                  <Plus size={15} /> Variant
                </button>
              </div>
              <div className="grid gap-3">
                {variants.map((variant, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <MiniField label="Color" value={variant.color} onChange={(value) => updateVariant(index, "color", value)} />
                      <MiniField label="Hex" value={variant.colorHex} onChange={(value) => updateVariant(index, "colorHex", value)} />
                      <MiniField label="Size" value={variant.size} onChange={(value) => updateVariant(index, "size", value)} />
                      <MiniField label="SKU" value={variant.sku} onChange={(value) => updateVariant(index, "sku", value)} />
                      <MiniField label="Stock" type="number" value={variant.stock} onChange={(value) => updateVariant(index, "stock", value)} />
                      <MiniField label="MRP" type="number" value={variant.price || form.price} onChange={(value) => updateVariant(index, "price", value)} />
                      <MiniField label="Sale" type="number" value={variant.salePrice || form.salePrice} onChange={(value) => updateVariant(index, "salePrice", value)} />
                      <MiniField label="Material" value={variant.material} onChange={(value) => updateVariant(index, "material", value)} />
                      <MiniField label="Pattern" value={variant.pattern} onChange={(value) => updateVariant(index, "pattern", value)} />
                      <label className="text-xs font-black text-slate-600 sm:col-span-3">
                        Variant image URLs
                        <input value={variant.imageUrls} onChange={(event) => updateVariant(index, "imageUrls", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900" placeholder="Comma separated, optional" />
                      </label>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-xs font-black text-slate-700">
                        <input type="checkbox" checked={variant.available} onChange={(event) => updateVariant(index, "available", event.target.checked)} className="accent-indigo-600" />
                        Available
                      </label>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(index)} className="inline-flex items-center gap-1 text-xs font-black text-red-600">
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Field label="SEO title" value={form.seoTitle} onChange={(value) => update("seoTitle", value)} className="sm:col-span-2" />
            <Field label="SEO description" value={form.seoDescription} onChange={(value) => update("seoDescription", value)} className="sm:col-span-2" />
            <Field label="Delivery text" value={form.deliveryText} onChange={(value) => update("deliveryText", value)} className="sm:col-span-2" />
            <Field label="Return policy" value={form.returnPolicy} onChange={(value) => update("returnPolicy", value)} className="sm:col-span-2" />
            <Field label="Tags comma separated" value={form.tags} onChange={(value) => update("tags", value)} className="sm:col-span-2" />
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              {["featured", "trending", "bestseller"].map((key) => (
                <label key={key} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold capitalize text-slate-700">
                  <input type="checkbox" checked={(form as any)[key]} onChange={(event) => update(key, event.target.checked)} className="accent-indigo-600" />
                  {key}
                </label>
              ))}
            </div>
          </div>

          <aside>
            <label className="grid min-h-52 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center hover:border-indigo-300">
              <ImagePlus className="mb-3 text-indigo-600" />
              <span className="font-black text-slate-800">Upload images</span>
              <span className="mt-1 text-sm text-slate-500">Select multiple product photos</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {existingImages.map((image) => (
                <div key={image.url} className="group relative">
                  <img src={image.url} alt={image.alt} className="aspect-square rounded-2xl object-cover ring-1 ring-slate-200" />
                  <button
                    type="button"
                    onClick={() => setExistingImages((current) => current.filter((entry) => entry.url !== image.url))}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              {previews.map((preview) => (
                <img key={preview.url} src={preview.url} alt={preview.name} className="aspect-square rounded-2xl object-cover ring-1 ring-slate-200" />
              ))}
            </div>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <PackagePlus size={18} />} {isEditing ? "Update Product" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, className }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={`text-sm font-bold text-slate-700 ${className ?? ""}`}>
      {label} {required && <span className="text-red-500">*</span>}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900" />
    </label>
  );
}

function MiniField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-xs font-black text-slate-600">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900" />
    </label>
  );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-48 rounded-b-2xl border border-t-0 border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none"
      }
    }
  });

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  };

  const tools = [
    { label: "B", action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
    { label: "I", action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
    { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
    { label: "List", action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
    { label: "Table", action: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: editor?.isActive("table") },
    { label: "Image", action: addImage, active: false }
  ];

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 rounded-t-2xl border border-slate-200 bg-slate-50 p-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={tool.action}
            className={`rounded-xl px-3 py-2 text-xs font-black ${tool.active ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

type ImportResult = { row: number; title: string; status: "success" | "error"; message: string };

function BulkImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    successCount: number;
    errorCount: number;
    results: ImportResult[];
  } | null>(null);

  function handleFiles(selected: FileList | null) {
    if (!selected?.length) return;
    const f = selected[0];
    if (f && /\.(xlsx|xls|csv)$/i.test(f.name)) {
      setFile(f);
      setResults(null);
    } else {
      toast.error("Only .xlsx, .xls, or .csv files are supported.");
    }
  }

  async function downloadTemplate() {
    setDownloading(true);
    try {
      const { data } = await api.get("/products/bulk-import/template", { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded");
    } catch {
      toast.error("Unable to download template");
    } finally {
      setDownloading(false);
    }
  }

  async function runImport() {
    if (!file) {
      toast.error("Select a file first");
      return;
    }
    setImporting(true);
    setProgress(10);
    try {
      const body = new FormData();
      body.append("file", file);
      setProgress(30);
      const { data } = await api.post("/products/bulk-import", body, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.min(30 + Math.round((event.loaded / event.total) * 50), 80));
        },
      });
      setProgress(100);
      setResults(data);
      if (data.successCount > 0) {
        toast.success(`${data.successCount} product(s) imported successfully!`);
      }
      if (data.errorCount > 0) {
        toast.error(`${data.errorCount} row(s) had errors.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/45 p-0 sm:place-items-center sm:p-4">
      <div className="flex max-h-[96vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h3 className="text-xl font-black text-slate-950">Import Products from Excel</h3>
            <p className="text-sm text-slate-500">Upload a .xlsx, .xls, or .csv file with your product data.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Template download */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-800">Need the right format?</p>
              <p className="text-xs text-slate-500">Download our Excel template with all supported columns and a sample row.</p>
            </div>
            <button
              onClick={downloadTemplate}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            >
              {downloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
              Template
            </button>
          </div>

          {/* File drop zone */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
            className={`grid min-h-44 cursor-pointer place-items-center rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive ? "border-indigo-400 bg-indigo-50" : file ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:border-indigo-300"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="text-emerald-600" size={36} />
                <p className="font-black text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFile(null); setResults(null); }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-black text-red-600 hover:underline"
                >
                  <X size={14} /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-indigo-500" size={36} />
                <p className="font-black text-slate-800">Drop your Excel file here</p>
                <p className="text-sm text-slate-500">or click to browse — .xlsx, .xls, .csv</p>
              </div>
            )}
            <input
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          {/* Progress bar */}
          {importing && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-600">
                <span>Importing products…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="mt-6">
              <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl bg-slate-100 p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{results.total}</p>
                  <p className="text-xs font-bold text-slate-500">Total Rows</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">{results.successCount}</p>
                  <p className="text-xs font-bold text-emerald-600">Imported</p>
                </div>
                <div className="rounded-2xl bg-red-50 p-4 text-center">
                  <p className="text-2xl font-black text-red-700">{results.errorCount}</p>
                  <p className="text-xs font-bold text-red-600">Errors</p>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-bold text-slate-600">{item.row}</td>
                        <td className="max-w-[120px] truncate px-3 py-2 font-bold text-slate-800">{item.title || "—"}</td>
                        <td className="px-3 py-2">
                          {item.status === "success" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                              <Check size={12} /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                              <XCircle size={12} /> Error
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          {results?.successCount ? (
            <button onClick={onImported} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-500">
              <Check size={18} /> Done — Refresh Products
            </button>
          ) : (
            <>
              <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Cancel</button>
              <button onClick={runImport} disabled={importing || !file} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                {importing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Import Products
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
