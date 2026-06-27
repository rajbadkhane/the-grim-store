"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, Edit3, Eye, Loader2, Package, PackagePlus, Save, Store, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";

type SellerProfile = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
  category: string;
  gstNumber?: string;
  website?: string;
};

type SellerProduct = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  sku: string;
  stock: number;
  price: number;
  salePrice: number;
  productStatus: "draft" | "pending_review" | "active" | "rejected" | "inactive";
  adminNote?: string;
  images?: Array<string | { url?: string }>;
  category?: string;
  shortDescription?: string;
  description?: string;
};

type SellerOrder = {
  id: string;
  orderId: string;
  products: Array<{ title: string; quantity: number; salePrice?: number; sellerName?: string; sku?: string; image?: string }>;
  orderStatus: string;
  paymentStatus: string;
  trackingStatus: string;
  totalAmount: number;
  createdAt?: string;
};

type Category = { id: string; name: string };

type ProductForm = {
  title: string;
  brand: string;
  sku: string;
  category: string;
  price: string;
  salePrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  imageUrls: string;
};

const emptyForm: ProductForm = {
  title: "",
  brand: "",
  sku: "",
  category: "",
  price: "",
  salePrice: "",
  stock: "",
  shortDescription: "",
  description: "",
  imageUrls: ""
};

export default function SellerPanelPage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0 });
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SellerProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [tab, setTab] = useState<"products" | "orders" | "profile">("products");

  async function load() {
    setLoading(true);
    try {
      const [meRes, productRes, orderRes, categoryRes] = await Promise.all([
        api.get("/seller/me"),
        api.get("/seller/products"),
        api.get("/seller/orders"),
        api.get("/products/categories")
      ]);
      setProfile(meRes.data.profile ?? null);
      setStats(meRes.data.stats ?? { total: 0, active: 0, pending: 0, rejected: 0 });
      setProducts(productRes.data.products ?? []);
      setOrders(orderRes.data.orders ?? []);
      setCategories(categoryRes.data.categories ?? []);
      if (!form.category && categoryRes.data.categories?.[0]?.id) {
        setForm((current) => ({ ...current, category: categoryRes.data.categories[0].id }));
      }
    } catch (error: any) {
      setProfile(null);
      toast.error(error.response?.data?.message ?? "Approved seller access required");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  function editProduct(product: SellerProduct) {
    const imageUrls = (product.images ?? []).map((image) => (typeof image === "string" ? image : image.url)).filter(Boolean).join("\n");
    setEditing(product);
    setForm({
      title: product.title ?? "",
      brand: product.brand ?? "",
      sku: product.sku ?? "",
      category: product.category ?? categories[0]?.id ?? "",
      price: String(product.price ?? ""),
      salePrice: String(product.salePrice ?? ""),
      stock: String(product.stock ?? ""),
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      imageUrls
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?.id ?? "" });
  }

  async function saveProduct() {
    if (!form.title.trim() || !form.brand.trim() || !form.sku.trim() || !form.category || !form.price || !form.salePrice) {
      toast.error("Fill product title, brand, SKU, category, and pricing");
      return;
    }

    const images = form.imageUrls
      .split(/\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: form.title.trim() }));
    const price = Number(form.price);
    const salePrice = Number(form.salePrice);
    const stock = Number(form.stock || 0);
    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim(),
      sku: form.sku.trim(),
      category: form.category,
      gender: "unisex",
      price,
      salePrice,
      stock,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim() || form.shortDescription.trim() || form.title.trim(),
      tags: [],
      colors: [{ name: "Default", hex: "#111111" }],
      sizes: [{ label: "One Size", stock }],
      images,
      variants: [
        {
          color: "Default",
          colorHex: "#111111",
          size: "One Size",
          sku: form.sku.trim(),
          stock,
          price,
          salePrice,
          images,
          available: stock > 0
        }
      ],
      summary: [{ text: form.shortDescription.trim() || "Seller listed product reviewed by The Grim Store." }],
      careInstructions: [],
      sizeChart: [],
      deliveryInfo: { text: "Standard delivery usually takes 3-6 business days after dispatch." },
      returnPolicy: "Returns and exchanges follow The Grim Store marketplace policy.",
      featured: false,
      trending: false,
      bestseller: false,
      seoTitle: form.title.trim(),
      seoDescription: form.shortDescription.trim() || form.description.trim() || form.title.trim(),
      metaKeywords: []
    };

    setSaving(true);
    try {
      if (editing) await api.patch(`/seller/products/${editing.id}`, payload);
      else await api.post("/seller/products", payload);
      toast.success(editing ? "Product sent for admin review" : "Product submitted for admin review");
      resetForm();
      await load();
    } catch (error: any) {
      const fieldErrors = error.response?.data?.errors?.fieldErrors;
      const firstError = fieldErrors ? Object.values(fieldErrors)[0] : null;
      toast.error(Array.isArray(firstError) ? String(firstError[0]) : error.response?.data?.message ?? "Unable to save product");
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct(product: SellerProduct) {
    if (!confirm(`Remove "${product.title}" from your seller catalog?`)) return;
    try {
      await api.delete(`/seller/products/${product.id}`);
      toast.success(product.productStatus === "active" ? "Removal request saved" : "Product removed");
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to remove product");
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm font-bold text-neutral-500">Loading seller panel...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Store className="mx-auto mb-4 text-[var(--accent)]" size={40} />
        <h1 className="text-3xl font-black text-neutral-950 dark:text-white">Approved seller access required</h1>
        <p className="mt-3 text-sm font-bold text-neutral-500 dark:text-white/55">
          Submit a seller request or wait for admin approval before opening the seller dashboard.
        </p>
        <Link href="/become-a-seller" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-[var(--accent)] px-6 text-sm font-black text-white">
          Become a Seller
        </Link>
      </div>
    );
  }

  return (
    <div className="mobile-bottom-safe bg-transparent px-4 py-8 text-neutral-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-col gap-3 border-b border-neutral-200 pb-5 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">Seller Panel</p>
            <h1 className="mt-2 text-3xl font-black">{profile.businessName}</h1>
            <p className="mt-1 text-sm font-bold text-neutral-500 dark:text-white/55">
              Add products, track review status, and view orders for your marketplace listings.
            </p>
          </div>
          <button onClick={load} className="inline-flex min-h-10 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-black dark:border-white/10">
            Refresh
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Package} label="Total Products" value={stats.total} />
          <Metric icon={Eye} label="Live Products" value={stats.active} />
          <Metric icon={BarChart3} label="Pending Review" value={stats.pending} />
          <Metric icon={X} label="Rejected" value={stats.rejected} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">{editing ? "Edit Product" : "Add Product"}</h2>
                <p className="text-xs font-bold text-neutral-500">Every save goes to admin review.</p>
              </div>
              {editing && (
                <button onClick={resetForm} className="rounded-md border border-neutral-200 p-2 text-neutral-500 dark:border-white/10">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="grid gap-3">
              <Field label="Product title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Field label="Brand" value={form.brand} onChange={(value) => setForm((current) => ({ ...current, brand: value }))} />
                <Field label="SKU" value={form.sku} onChange={(value) => setForm((current) => ({ ...current, sku: value }))} />
              </div>
              <label className="text-xs font-black uppercase tracking-wide text-neutral-500">
                Category
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm font-bold text-neutral-900 outline-none dark:border-white/10 dark:bg-black dark:text-white">
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <Field label="MRP" type="number" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} />
                <Field label="Sale price" type="number" value={form.salePrice} onChange={(value) => setForm((current) => ({ ...current, salePrice: value }))} />
                <Field label="Stock" type="number" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} />
              </div>
              <Field label="Short description" value={form.shortDescription} onChange={(value) => setForm((current) => ({ ...current, shortDescription: value }))} />
              <TextArea label="Full description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
              <TextArea label="Image URLs, one per line" value={form.imageUrls} onChange={(value) => setForm((current) => ({ ...current, imageUrls: value }))} />
              <button onClick={saveProduct} disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-black text-white disabled:opacity-60">
                {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                {editing ? "Send Update For Review" : "Submit For Review"}
              </button>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              {(["products", "orders", "profile"] as const).map((item) => (
                <button key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-xs font-black uppercase tracking-wide ${tab === item ? "bg-[var(--accent)] text-white" : "border border-neutral-200 text-neutral-600 dark:border-white/10 dark:text-white/60"}`}>
                  {item}
                </button>
              ))}
            </div>

            {tab === "products" && (
              <div className="grid gap-3">
                {products.map((product) => (
                  <article key={product.id} className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black">{product.title}</h3>
                          <StatusBadge status={product.productStatus} />
                        </div>
                        <p className="mt-1 text-xs font-bold text-neutral-500">{product.brand} • SKU {product.sku}</p>
                        <p className="mt-2 text-sm font-black text-[var(--accent)]">{formatMoney(product.salePrice)} <span className="text-xs text-neutral-400 line-through">{formatMoney(product.price)}</span></p>
                        {product.adminNote && <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{product.adminNote}</p>}
                      </div>
                      <div className="flex gap-2">
                        {product.productStatus === "active" && (
                          <Link href={`/products/${product.slug}`} className="rounded-md border border-neutral-200 p-2 text-neutral-600 dark:border-white/10 dark:text-white/70">
                            <Eye size={16} />
                          </Link>
                        )}
                        <button onClick={() => editProduct(product)} className="rounded-md border border-neutral-200 p-2 text-neutral-600 dark:border-white/10 dark:text-white/70">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => archiveProduct(product)} className="rounded-md border border-neutral-200 p-2 text-red-600 dark:border-white/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {!products.length && <EmptyState icon={PackagePlus} text="No seller products yet. Add your first product for admin review." />}
              </div>
            )}

            {tab === "orders" && (
              <div className="grid gap-3">
                {recentOrders.map((order) => (
                  <article key={order.id} className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-neutral-400">Order {order.orderId}</p>
                        <h3 className="mt-1 font-black">{order.products.map((item) => item.title).join(", ")}</h3>
                        <p className="mt-1 text-xs font-bold text-neutral-500">{order.trackingStatus}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-black text-[var(--accent)]">{formatMoney(order.products.reduce((sum, item) => sum + Number(item.salePrice ?? 0) * Number(item.quantity ?? 1), 0))}</p>
                        <p className="text-xs font-bold uppercase text-neutral-500">{order.orderStatus} • {order.paymentStatus}</p>
                      </div>
                    </div>
                  </article>
                ))}
                {!orders.length && <EmptyState icon={Package} text="Orders for your products will appear here after checkout." />}
              </div>
            )}

            {tab === "profile" && (
              <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <h2 className="text-lg font-black">Business Profile</h2>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Owner" value={profile.ownerName} />
                  <Info label="Email" value={profile.email} />
                  <Info label="Phone" value={profile.phone} />
                  <Info label="Category" value={profile.category} />
                  <Info label="City" value={`${profile.city} ${profile.pincode}`} />
                  <Info label="GST" value={profile.gstNumber || "Not provided"} />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <Icon className="text-[var(--accent)]" size={20} />
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-xs font-black uppercase tracking-wide text-neutral-500">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm font-bold text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-white/10 dark:bg-black dark:text-white" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-black uppercase tracking-wide text-neutral-500">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm font-bold text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-white/10 dark:bg-black dark:text-white" />
    </label>
  );
}

function StatusBadge({ status }: { status: SellerProduct["productStatus"] }) {
  const classes: Record<SellerProduct["productStatus"], string> = {
    active: "bg-emerald-50 text-emerald-700",
    pending_review: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
    inactive: "bg-neutral-100 text-neutral-600",
    draft: "bg-neutral-100 text-neutral-600"
  };
  return <span className={`rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide ${classes[status]}`}>{status.replace("_", " ")}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-neutral-50 p-3 dark:bg-white/[0.04]">
      <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-neutral-250 text-center text-neutral-500 dark:border-white/10">
      <div>
        <Icon className="mx-auto mb-2" size={28} />
        <p className="text-sm font-bold">{text}</p>
      </div>
    </div>
  );
}
