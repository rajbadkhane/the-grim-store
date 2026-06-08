"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Flag, Loader2, RefreshCcw, Star, ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Review = {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: Array<{ url: string; alt?: string }>;
  verifiedPurchase: boolean;
  helpfulCount: number;
  reported: boolean;
  createdAt?: string;
  product?: { id: string; title: string; slug: string };
};

const storefrontUrl = (process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "reported" | "verified">("all");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/reviews");
      setReviews(res.data?.reviews ?? []);
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

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Trust content</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Reviews</h2>
          <p className="mt-1 text-sm text-slate-500">Customer reviews stored in SQL and rendered on product pages for SEO and buyer confidence.</p>
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
          <p className="mt-4 text-xs font-bold text-slate-400">Indexed on product page JSON-LD when visible.</p>
        </div>
      </div>
    </article>
  );
}
