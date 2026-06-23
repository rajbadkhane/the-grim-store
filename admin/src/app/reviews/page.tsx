"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Flag, ImagePlus, Loader2, Plus, RefreshCcw, Send, Star, ThumbsUp, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Review = {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: Array<{ url: string; alt?: string; publicId?: string }>;
  verifiedPurchase: boolean;
  helpfulCount: number;
  reported: boolean;
  createdAt?: string;
  product?: { id: string; title: string; slug: string };
};

type ProductOption = {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  sku?: string;
  images?: Array<{ url: string; alt?: string }>;
};

type ManualReviewForm = {
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  imageUrls: string;
  verifiedPurchase: boolean;
};

const initialManualReview: ManualReviewForm = {
  productId: "",
  userName: "Verified buyer",
  rating: 5,
  title: "",
  comment: "",
  imageUrls: "",
  verifiedPurchase: true
};

const storefrontUrl = (process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "reported" | "verified">("all");
  const [form, setForm] = useState<ManualReviewForm>(initialManualReview);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [reviewsRes, productsRes] = await Promise.all([
        api.get("/reviews"),
        api.get("/products?limit=500")
      ]);
      const nextReviews = reviewsRes.data?.reviews ?? [];
      const nextProducts = productsRes.data?.items ?? [];
      setReviews(nextReviews);
      setProducts(nextProducts);
      setForm((current) => ({
        ...current,
        productId: current.productId || nextProducts[0]?.id || ""
      }));
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) router.push("/login");
      else toast.error(error.response?.data?.message ?? "Unable to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "reported") return reviews.filter((review) => review.reported);
    if (filter === "verified") return reviews.filter((review) => review.verifiedPurchase);
    return reviews;
  }, [reviews, filter]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const previews = useMemo(() => files.map((file) => ({ file, name: file.name, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function updateForm<K extends keyof ManualReviewForm>(key: K, value: ManualReviewForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function removeFile(file: File) {
    setFiles((current) => current.filter((item) => item !== file));
  }

  async function submitManualReview() {
    if (!form.productId) {
      toast.error("Select a product");
      return;
    }
    if (form.userName.trim().length < 2) {
      toast.error("Enter reviewer name");
      return;
    }
    if (form.title.trim().length < 3) {
      toast.error("Enter a review title");
      return;
    }
    if (form.comment.trim().length < 10) {
      toast.error("Write at least 10 characters in the review");
      return;
    }

    setSaving(true);
    try {
      let uploadedImages: Review["images"] = [];
      if (files.length) {
        const body = new FormData();
        files.forEach((file) => body.append("images", file));
        const { data } = await api.post("/uploads/images", body, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImages = data.images ?? [];
      }

      const pastedImages = form.imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => ({ url, alt: `${form.title.trim()} review image` }));

      const { data } = await api.post("/reviews/manual", {
        productId: form.productId,
        userName: form.userName.trim(),
        userAvatar: "",
        rating: form.rating,
        title: form.title.trim(),
        comment: form.comment.trim(),
        images: [...uploadedImages, ...pastedImages],
        verifiedPurchase: form.verifiedPurchase
      });

      const product = products.find((item) => item.id === form.productId);
      const createdReview = {
        ...data.review,
        product: product ? { id: product.id, title: product.title, slug: product.slug } : undefined
      };

      setReviews((current) => [createdReview, ...current]);
      setForm((current) => ({ ...initialManualReview, productId: current.productId }));
      setFiles([]);
      toast.success("Manual review published");
    } catch (error: any) {
      const fieldErrors = error.response?.data?.errors?.fieldErrors;
      const firstError = fieldErrors ? Object.entries(fieldErrors)[0] : null;
      toast.error(firstError ? `${firstError[0]}: ${(firstError[1] as string[])[0]}` : error.response?.data?.message ?? "Unable to publish review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Trust content</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Reviews</h2>
          <p className="mt-1 text-sm text-slate-500">Create manual product reviews and manage customer reviews rendered on product pages.</p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total reviews" value={reviews.length} />
        <Stat label="Average rating" value={average.toFixed(1)} />
        <Stat label="Verified" value={reviews.filter((review) => review.verifiedPurchase).length} />
        <Stat label="Reported" value={reviews.filter((review) => review.reported).length} />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-indigo-600" />
            <h3 className="text-lg font-black text-slate-950">Add manual review</h3>
          </div>
          <p className="text-sm text-slate-500">Select any database product, add a rating, write the review, and optionally upload images. You can add multiple reviews to the same product.</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">
              Product <span className="text-red-500">*</span>
              <select
                value={form.productId}
                onChange={(event) => updateForm("productId", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400"
              >
                {products.length === 0 && <option value="">No products found</option>}
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}{product.sku ? ` (${product.sku})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <Field label="Reviewer name" required value={form.userName} onChange={(value) => updateForm("userName", value)} />
            <label className="text-sm font-bold text-slate-700">
              Rating <span className="text-red-500">*</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateForm("rating", rating)}
                    className={`inline-flex items-center gap-1 rounded-2xl border px-3.5 py-2 text-xs font-black ${
                      form.rating >= rating ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {rating} <Star size={14} fill="currentColor" />
                  </button>
                ))}
              </div>
            </label>
            <Field label="Review title" required value={form.title} onChange={(value) => updateForm("title", value)} className="sm:col-span-2" />
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">
              Review comment <span className="text-red-500">*</span>
              <textarea
                value={form.comment}
                onChange={(event) => updateForm("comment", event.target.value)}
                className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-indigo-400"
                placeholder="Write the review that should appear on the selected product."
              />
            </label>
            <Field label="Image URLs, comma separated" value={form.imageUrls} onChange={(value) => updateForm("imageUrls", value)} className="sm:col-span-2" />
            <label className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={form.verifiedPurchase} onChange={(event) => updateForm("verifiedPurchase", event.target.checked)} className="accent-indigo-600" />
              Mark as verified buyer
            </label>
          </div>

          <aside>
            <label className="grid min-h-44 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center hover:border-indigo-300">
              <ImagePlus className="mb-3 text-indigo-600" />
              <span className="font-black text-slate-800">Upload review images</span>
              <span className="mt-1 text-sm text-slate-500">Optional customer photos</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
            </label>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {previews.map((preview) => (
                  <div key={`${preview.name}-${preview.file.lastModified}`} className="group relative">
                    <img src={preview.url} alt={preview.name} className="aspect-square rounded-2xl object-cover ring-1 ring-slate-200" />
                    <button
                      type="button"
                      onClick={() => removeFile(preview.file)}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={submitManualReview}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Publish Review
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["verified", "Verified buyers"],
            ["reported", "Reported"]
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`rounded-2xl px-4 py-2 text-sm font-black ${filter === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="mx-auto mb-2 animate-spin" /> Loading reviews
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="py-12 text-center text-sm font-bold text-slate-500">No reviews found.</p>}
        {!loading && (
          <div className="grid gap-4">
            {filtered.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, className }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={`text-sm font-bold text-slate-700 ${className ?? ""}`}>
      {label} {required && <span className="text-red-500">*</span>}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-indigo-400" />
    </label>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
              {review.rating} <Star size={14} fill="currentColor" />
            </span>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                <BadgeCheck size={14} /> Verified buyer
              </span>
            )}
            {review.reported && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
                <Flag size={14} /> Reported
              </span>
            )}
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-950">{review.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
          {review.images?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {review.images.map((image) => (
                <img key={image.url} src={image.url} alt={image.alt ?? review.title} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200" />
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-black text-slate-500">
            <span>{review.userName || "Verified buyer"}</span>
            <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
            <span className="inline-flex items-center gap-1"><ThumbsUp size={13} /> {review.helpfulCount}</span>
          </div>
        </div>
        <div className="min-w-64 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Product</p>
          {review.product?.slug ? (
            <Link href={`${storefrontUrl}/products/${review.product.slug}`} target="_blank" className="mt-2 block text-sm font-black text-indigo-700 hover:text-indigo-500">
              {review.product.title}
            </Link>
          ) : (
            <p className="mt-2 text-sm font-bold text-slate-500">Product unavailable</p>
          )}
          <p className="mt-4 text-xs font-bold text-slate-400">Visible on the selected product page when not reported.</p>
        </div>
      </div>
    </article>
  );
}
