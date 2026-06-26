"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type SellerRequest = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
  category: string;
  productCount?: string;
  monthlySales?: string;
  gstNumber?: string;
  website?: string;
  message?: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  adminNote?: string;
  createdAt?: string;
};

const statuses = ["pending", "reviewing", "approved", "rejected"] as const;

export default function SellerRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/seller-requests");
      setRequests(data.requests ?? []);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) router.push("/login");
      else toast.error(error.response?.data?.message ?? "Unable to load seller requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return requests.filter((request) => [request.businessName, request.ownerName, request.email, request.city, request.category, request.status].join(" ").toLowerCase().includes(value));
  }, [requests, query]);

  async function updateRequest(request: SellerRequest, status: SellerRequest["status"], adminNote = request.adminNote ?? "") {
    try {
      const { data } = await api.patch(`/seller-requests/${request.id}`, { status, adminNote });
      setRequests((current) => current.map((item) => (item.id === request.id ? data.request : item)));
      toast.success("Seller request updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to update request");
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Marketplace</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Seller Requests</h2>
          <p className="mt-1 text-sm text-slate-500">Review businesses that want to sell on The Grim Store.</p>
        </div>
        <label className="flex w-full max-w-md items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-400">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none" />
        </label>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="grid min-h-52 place-items-center text-slate-500">
            <Loader2 className="mb-2 animate-spin" /> Loading seller requests
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((request) => (
              <article key={request.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{request.businessName}</h3>
                    <p className="text-sm font-semibold text-slate-500">{request.ownerName} • {request.city} {request.pincode}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${badgeClass(request.status)}`}>{request.status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p><span className="font-black text-slate-900">Email:</span> {request.email}</p>
                  <p><span className="font-black text-slate-900">Phone:</span> {request.phone}</p>
                  <p><span className="font-black text-slate-900">Category:</span> {request.category}</p>
                  <p><span className="font-black text-slate-900">Products:</span> {request.productCount || "Not provided"}</p>
                  <p><span className="font-black text-slate-900">Sales:</span> {request.monthlySales || "Not provided"}</p>
                  <p><span className="font-black text-slate-900">GST:</span> {request.gstNumber || "Not provided"}</p>
                </div>
                {request.website && <p className="mt-3 text-sm font-semibold text-indigo-600">{request.website}</p>}
                {request.message && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{request.message}</p>}

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <select
                    value={request.status}
                    onChange={(event) => updateRequest(request, event.target.value as SellerRequest["status"])}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800"
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <button onClick={() => updateRequest(request, "approved")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">
                    <CheckCircle2 size={17} /> Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center text-center text-slate-500">
            <p className="font-bold">No seller requests found.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function badgeClass(status: SellerRequest["status"]) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
