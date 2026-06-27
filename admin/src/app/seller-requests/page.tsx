"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, KeyRound, Loader2, Search, UserPlus } from "lucide-react";
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
  sellerUserId?: string | null;
  sellerProfileId?: string | null;
  sellerHasCredentials?: boolean;
  createdAt?: string;
};

const statuses = ["pending", "reviewing", "approved", "rejected"] as const;
const emptyDirectSeller = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  city: "",
  pincode: "",
  category: "",
  password: ""
};

export default function SellerRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [directSeller, setDirectSeller] = useState(emptyDirectSeller);
  const [creatingDirect, setCreatingDirect] = useState(false);

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

  async function setCredentialsForRequest(request: SellerRequest, mode: "manual" | "generated") {
    setBusyId(request.id);
    try {
      const password = mode === "manual" ? passwords[request.id]?.trim() : "";
      const { data } = await api.post(`/seller-requests/${request.id}/credentials`, { password });
      setRequests((current) => current.map((item) => (item.id === request.id ? data.request : item)));
      setCredentials(data.credentials ?? null);
      setPasswords((current) => ({ ...current, [request.id]: "" }));
      toast.success(mode === "manual" ? "Seller password saved" : "Seller password generated");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to save seller credentials");
    } finally {
      setBusyId(null);
    }
  }

  async function createDirectSeller(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingDirect(true);
    try {
      const { data } = await api.post("/seller-requests/accounts", directSeller);
      setRequests((current) => [data.request, ...current.filter((item) => item.id !== data.request?.id)]);
      setCredentials(data.credentials ?? null);
      setDirectSeller(emptyDirectSeller);
      toast.success("Seller login created");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to create seller");
    } finally {
      setCreatingDirect(false);
    }
  }

  async function copyCredentials() {
    if (!credentials) return;
    await navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
    toast.success("Credentials copied");
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

      {credentials && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-700">Seller credentials shown once</p>
              <p className="mt-1 font-mono">Email: {credentials.email}</p>
              <p className="font-mono">Password: {credentials.password}</p>
            </div>
            <button onClick={copyCredentials} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white">
              <Copy size={15} /> Copy
            </button>
          </div>
        </div>
      )}

      <form onSubmit={createDirectSeller} className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Create Seller Login</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">Direct seller account</h3>
          </div>
          <button disabled={creatingDirect} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {creatingDirect ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />} Create Seller
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <SellerInput label="Business" value={directSeller.businessName} onChange={(value) => setDirectSeller((current) => ({ ...current, businessName: value }))} required />
          <SellerInput label="Owner" value={directSeller.ownerName} onChange={(value) => setDirectSeller((current) => ({ ...current, ownerName: value }))} required />
          <SellerInput label="Email" type="email" value={directSeller.email} onChange={(value) => setDirectSeller((current) => ({ ...current, email: value }))} required />
          <SellerInput label="Phone" value={directSeller.phone} onChange={(value) => setDirectSeller((current) => ({ ...current, phone: value }))} required />
          <SellerInput label="City" value={directSeller.city} onChange={(value) => setDirectSeller((current) => ({ ...current, city: value }))} required />
          <SellerInput label="Pincode" value={directSeller.pincode} onChange={(value) => setDirectSeller((current) => ({ ...current, pincode: value }))} required />
          <SellerInput label="Category" value={directSeller.category} onChange={(value) => setDirectSeller((current) => ({ ...current, category: value }))} required />
          <SellerInput label="Password optional" type="password" value={directSeller.password} onChange={(value) => setDirectSeller((current) => ({ ...current, password: value }))} />
        </div>
        <p className="mt-3 text-xs font-bold text-slate-500">Leave password blank to generate a secure seller password.</p>
      </form>

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
                    <p className="text-sm font-semibold text-slate-500">{request.ownerName} - {request.city} {request.pincode}</p>
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
                {request.status === "approved" && (
                  <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                    Seller access active
                    <span className="mt-1 block font-mono text-[11px] text-emerald-700">User: {request.sellerUserId ?? "linked on next approval sync"}</span>
                    <span className="block font-mono text-[11px] text-emerald-700">Profile: {request.sellerProfileId ?? "linked on next approval sync"}</span>
                    <span className="block font-mono text-[11px] text-emerald-700">Password: {request.sellerHasCredentials ? "set" : "not set"}</span>
                  </div>
                )}

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

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Seller Login</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <input
                      value={passwords[request.id] ?? ""}
                      onChange={(event) => setPasswords((current) => ({ ...current, [request.id]: event.target.value }))}
                      placeholder="Manual password or generate"
                      type="password"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none"
                    />
                    <button
                      onClick={() => setCredentialsForRequest(request, "manual")}
                      disabled={busyId === request.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                    >
                      {busyId === request.id ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} {request.status === "approved" ? "Save" : "Approve + Save"}
                    </button>
                    <button
                      onClick={() => setCredentialsForRequest(request, "generated")}
                      disabled={busyId === request.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 disabled:opacity-60"
                    >
                      {request.sellerHasCredentials ? "Reset" : "Generate"}
                    </button>
                  </div>
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

function SellerInput({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400"
      />
    </label>
  );
}

function badgeClass(status: SellerRequest["status"]) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
