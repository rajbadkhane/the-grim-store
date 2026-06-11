"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, Camera, Loader2, Send, Star, ThumbsUp } from "lucide-react";
import { api } from "@/lib/api";
import type { StoreProduct, StoreReview } from "@/lib/catalog-api";

type SortKey = "latest" | "highest" | "lowest" | "helpful" | "images";
type ReviewOrder = {
  id: string;
  orderId: string;
  orderStatus: string;
  products: Array<{ product?: string; id?: string; title?: string }>;
};

export function ReviewPanel({ product, initialReviews }: { product: StoreProduct; initialReviews: StoreReview[] }) {
  const [reviews, setReviews] = useState<StoreReview[]>(initialReviews);
  const [sort, setSort] = useState<SortKey>("latest");
  const [orders, setOrders] = useState<ReviewOrder[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  async function loadReviews(nextSort = sort) {
    setLoadingReviews(true);
    try {
      const params = nextSort === "images" ? "?withImages=true" : `?sort=${nextSort}`;
      const res = await api.get(`/reviews/product/${product.id}${params}`);
      setReviews(res.data?.reviews ?? []);
    } catch {
      toast.error("Unable to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const res = await api.get("/orders/mine");
      setOrders(res.data?.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const distribution = useMemo(() => {
    const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      result[review.rating] = (result[review.rating] ?? 0) + 1;
    });
    return result;
  }, [reviews]);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : Number(product.rating ?? 0);
  const max = Math.max(1, ...Object.values(distribution).map(Number));
  const eligibleOrders = orders.filter((order) => order.orderStatus === "delivered" && order.products.some((item) => item.product === product.id || String(item.id ?? "").startsWith(product.id)));

  async function changeSort(nextSort: SortKey) {
    setSort(nextSort);
    await loadReviews(nextSort);
  }

  async function markHelpful(reviewId: string) {
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`);
      const next = res.data?.review as StoreReview;
      setReviews((current) => current.map((review) => (review.id === reviewId ? next : review)));
      toast.success("Marked helpful");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Login required to mark helpful");
    }
  }

  return (
    <section className="mt-14 border-t border-white/10 pt-10">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside>
          <h2 className="text-3xl font-black">Ratings & Reviews</h2>
          <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black">{average.toFixed(1)}</span>
              <Star className="text-amber-300" fill="currentColor" />
            </div>
            <p className="mt-2 text-sm text-white/50">{reviews.length || product.reviewCount || 0} customer reviews</p>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="mt-3 flex items-center gap-2 text-xs">
                <span className="w-4">{rating}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
                  <div className="h-full bg-blue-600" style={{ width: `${(Number(distribution[rating]) / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <ReviewForm product={product} eligibleOrders={eligibleOrders} loadingOrders={loadingOrders} onCreated={(review) => setReviews((current) => [review, ...current])} />
          <div className="mb-5 mt-6 flex flex-wrap gap-2">
            {[
              ["latest", "Latest"],
              ["highest", "Highest rating"],
              ["lowest", "Lowest rating"],
              ["helpful", "Most helpful"],
              ["images", "With images"]
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => changeSort(key as SortKey)}
                className={`rounded-md border px-3 py-2 text-sm font-bold ${sort === key ? "border-blue-500 bg-blue-600/15 text-white" : "border-white/10 text-white/65 hover:border-blue-500"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-4">
            {loadingReviews && <p className="text-sm font-bold text-white/55">Loading reviews...</p>}
            {!loadingReviews && reviews.length === 0 && <p className="rounded-md border border-white/10 p-5 text-sm font-bold text-white/55">No reviews yet. Delivered buyers can write the first review.</p>}
            {!loadingReviews && reviews.map((review) => <ReviewCard key={review.id} review={review} onHelpful={markHelpful} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewForm({
  product,
  eligibleOrders,
  loadingOrders,
  onCreated
}: {
  product: StoreProduct;
  eligibleOrders: ReviewOrder[];
  loadingOrders: boolean;
  onCreated: (review: StoreReview) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ orderId: "", rating: 5, title: "", comment: "", imageUrls: "" });

  useEffect(() => {
    if (!form.orderId && eligibleOrders[0]) setForm((current) => ({ ...current, orderId: eligibleOrders[0].id }));
  }, [eligibleOrders, form.orderId]);

  async function submit() {
    if (!form.orderId) {
      toast.error("A delivered order is required to review this product");
      return;
    }
    if (form.comment.trim().length < 10) {
      toast.error("Write at least 10 characters in your review");
      return;
    }
    const title = form.title.trim() || makeReviewTitle(form.comment);
    setSaving(true);
    try {
      const images = form.imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => ({ url, alt: `${product.title} customer review` }));
      const res = await api.post("/reviews", {
        productId: product.id,
        orderId: form.orderId,
        rating: form.rating,
        title,
        comment: form.comment.trim(),
        images
      });
      onCreated(res.data.review);
      router.refresh();
      setOpen(false);
      setForm({ orderId: eligibleOrders[0]?.id ?? "", rating: 5, title: "", comment: "", imageUrls: "" });
      toast.success("Review published");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to publish review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-black">Write a verified review</h3>
          <p className="mt-1 text-sm text-white/50">Share fit, fabric, sizing, delivery, and photos after delivery.</p>
        </div>
        <button onClick={() => setOpen((value) => !value)} className="rounded-md bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-500">
          {open ? "Close form" : "Write review"}
        </button>
      </div>
      {open && (
        <div className="mt-5 grid gap-4">
          {loadingOrders && <p className="text-sm font-bold text-white/55">Checking delivered orders...</p>}
          {!loadingOrders && eligibleOrders.length === 0 && (
            <p className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">Only delivered buyers can review this product. Once your parcel is marked delivered, the review form unlocks.</p>
          )}
          {eligibleOrders.length > 0 && (
            <>
              <select value={form.orderId} onChange={(event) => setForm((current) => ({ ...current, orderId: event.target.value }))} className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm font-bold outline-none focus:border-blue-500">
                {eligibleOrders.map((order) => <option key={order.id} value={order.id}>{order.orderId}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} onClick={() => setForm((current) => ({ ...current, rating }))} className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-black ${form.rating >= rating ? "border-amber-300/40 bg-amber-300/15 text-amber-200" : "border-white/10 text-white/50"}`}>
                    {rating} <Star size={14} fill="currentColor" />
                  </button>
                ))}
              </div>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Review title" className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm font-bold outline-none focus:border-blue-500" />
              <textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Tell shoppers about fit, fabric, quality, and delivery..." className="min-h-32 rounded-md border border-white/10 bg-black px-3 py-3 text-sm font-bold outline-none focus:border-blue-500" />
              <label className="text-sm font-bold text-white/60">
                Optional image URLs
                <div className="mt-2 flex items-center gap-2 rounded-md border border-white/10 bg-black px-3 py-3">
                  <Camera size={17} className="text-white/35" />
                  <input value={form.imageUrls} onChange={(event) => setForm((current) => ({ ...current, imageUrls: event.target.value }))} placeholder="Comma-separated image URLs" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>
              <button onClick={submit} disabled={saving} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-60">
                {saving ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} Publish review
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function makeReviewTitle(comment: string) {
  const clean = comment.trim().replace(/\s+/g, " ");
  if (clean.length <= 42) return clean;
  return `${clean.slice(0, 39).trim()}...`;
}

function ReviewCard({ review, onHelpful }: { review: StoreReview; onHelpful: (reviewId: string) => void }) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black">{review.title}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-300">
            <BadgeCheck size={14} /> {review.verifiedPurchase ? "Verified buyer" : "Customer review"}
          </p>
          <p className="mt-1 text-xs text-white/35">{review.userName} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : "Recent"}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded bg-amber-300/15 px-2 py-1 text-sm text-amber-200">
          {review.rating} <Star size={14} fill="currentColor" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/64">{review.comment}</p>
      {review.images?.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {review.images.map((image) => (
            <div key={image.url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-900">
              <Image src={image.url} alt={image.alt ?? review.title} fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
      <button onClick={() => onHelpful(review.id)} className="mt-4 inline-flex items-center gap-2 text-sm text-white/55 hover:text-blue-300">
        <ThumbsUp size={16} /> Helpful ({review.helpfulCount})
      </button>
    </article>
  );
}
