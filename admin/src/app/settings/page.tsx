export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-4xl font-black">Settings & CMS</h1>
      <div className="mt-6 grid gap-4">
        {["Privacy Policy", "Refund Policy", "Cancellation Policy", "Terms & Conditions", "Shipping Policy"].map((page) => (
          <div key={page} className="rounded-md border border-white/10 bg-white/[0.035] p-5">
            <h2 className="font-black">{page}</h2>
            <textarea className="mt-3 min-h-28 w-full rounded-md border border-white/10 bg-black p-3 outline-none" placeholder={`Edit ${page}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
