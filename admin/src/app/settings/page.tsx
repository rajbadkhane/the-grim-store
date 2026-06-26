export default function SettingsPage() {
  return (
    <div>
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Storefront CMS</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Settings & CMS</h2>
        <p className="mt-1 text-sm text-slate-500">Draft policy content and storefront copy from one responsive workspace.</p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {["Privacy Policy", "Refund Policy", "Cancellation Policy", "Terms & Conditions", "Shipping Policy"].map((page) => (
          <div key={page} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">{page}</h2>
            <textarea className="mt-3 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-indigo-500" placeholder={`Edit ${page}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
