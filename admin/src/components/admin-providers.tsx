"use client";

import { Toaster } from "react-hot-toast";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, background: "#111827", color: "#fff" } }} />
    </>
  );
}
