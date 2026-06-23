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
    <section className="mt-14 border-t border-neutral-200 dark:border-neutral-800/60 pt-10 text-neutral-800 dark:text-neutral-200">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside>
          <h2 className="text-2xl font-black uppercase tracking-wider">Ratings & Reviews</h2>
          <div className="mt-5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111315]/50 p-5">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black text-neutral-900 dark:text-white">{average.toFixed(1)}</span>
              <Star className="text-amber-500 fill-amber-500" size={32} />
            </div>
            <p className="mt-2 text-xs font-bold text-neutral-500 dark:text-neutral-450 uppercase tracking-wide">
              {reviews.length || product.reviewCount || 0} Customer Reviews
            </p>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="mt-3 flex items-center gap-3 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <span className="w-3 shrink-0">{rating}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                  <div className="h-full bg-[#ff3f6c]" style={{ width: `${(Number(distribution[rating]) / max) * 100}%` }} />
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
                className={`rounded border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  sort === key
                    ? "border-[#ff3f6c] bg-[#ff3f6c]/5 text-[#ff3f6c]"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-[#ff3f6c] hover:text-[#ff3f6c]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {loadingReviews && <p className="text-xs font-bold text-neutral-500 dark:text-neutral-450 animate-pulse">Loading reviews...</p>}
            {!loadingReviews && reviews.length === 0 && (
              <p className="rounded border border-neutral-200 dark:border-neutral-800 p-5 text-xs font-semibold text-neutral-500 dark:text-neutral-450 bg-neutral-50 dark:bg-neutral-900/40">
                No reviews yet. Delivered buyers can write the first review.
              </p>
            )}
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
    <div className="rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111315]/50 p-5 mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Write a verified review</h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Share product quality, function, packaging, delivery, and photos after delivery.</p>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="rounded bg-[#ff3f6c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e6355e] transition-colors"
        >
          {open ? "Close form" : "Write review"}
        </button>
      </div>
      {open && (
        <div className="mt-5 grid gap-4">
          {loadingOrders && <p className="text-xs font-bold text-neutral-500 dark:text-neutral-450 animate-pulse">Checking delivered orders...</p>}
          {!loadingOrders && eligibleOrders.length === 0 && (
            <p className="rounded border border-amber-350 bg-amber-500/10 p-3 text-xs font-bold text-amber-800 dark:text-amber-200">
              Only delivered buyers can review this product. Once your parcel is marked delivered, the review form unlocks.
            </p>
          )}
          {eligibleOrders.length > 0 && (
            <>
              <select
                value={form.orderId}
                onChange={(event) => setForm((current) => ({ ...current, orderId: event.target.value }))}
                className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-xs font-bold outline-none focus:border-[#ff3f6c]"
              >
                {eligibleOrders.map((order) => <option key={order.id} value={order.id}>{order.orderId}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setForm((current) => ({ ...current, rating }))}
                    className={`inline-flex items-center gap-1 rounded border px-3.5 py-2 text-xs font-bold transition-colors ${
                      form.rating >= rating
                        ? "border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-300"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-450"
                    }`}
                  >
                    {rating} <Star size={14} fill="currentColor" />
                  </button>
                ))}
              </div>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Review title"
                className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-xs font-bold outline-none focus:border-[#ff3f6c]"
              />
              <textarea
                value={form.comment}
                onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                placeholder="Tell shoppers about product quality, function, packaging, and delivery..."
                className="min-h-32 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-xs font-bold outline-none focus:border-[#ff3f6c]"
              />
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-450">
                Optional image URLs
                <div className="mt-1.5 flex items-center gap-2 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5">
                  <Camera size={17} className="text-neutral-400" />
                  <input
                    value={form.imageUrls}
                    onChange={(event) => setForm((current) => ({ ...current, imageUrls: event.target.value }))}
                    placeholder="Comma-separated image URLs"
                    className="w-full bg-transparent text-xs outline-none text-neutral-850 dark:text-neutral-100 font-bold border-0 p-0"
                  />
                </div>
              </label>
              <button
                onClick={submit}
                disabled={saving}
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded bg-[#ff3f6c] px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e6355e] transition-colors disabled:opacity-60"
              >
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
    <article className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]/50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-sm text-neutral-900 dark:text-white">{review.title}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <BadgeCheck size={14} /> {review.verifiedPurchase ? "Verified buyer" : "Customer review"}
          </p>
          <p className="mt-1.5 text-xs text-neutral-450 dark:text-neutral-500 font-semibold">
            {review.userName} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : "Recent"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-200">
          {review.rating} <Star size={14} fill="currentColor" className="text-amber-500" />
        </span>
      </div>
      <p className="mt-3.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-350 font-medium">{review.comment}</p>
      {review.images?.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {review.images.map((image) => (
            <div key={image.url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
              <Image src={image.url} alt={image.alt ?? review.title} fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => onHelpful(review.id)}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-[#ff3f6c] dark:hover:text-[#ff3f6c] transition-colors"
      >
        <ThumbsUp size={14} /> Helpful ({review.helpfulCount})
      </button>
    </article>
  );
}
