import type { Metadata, Viewport } from "next";
import { AdminShell } from "@/components/admin-shell";
import { AdminProviders } from "@/components/admin-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Grim Store Admin",
  description: "Independent ecommerce admin dashboard for products, orders, analytics, users, coupons, and CMS.",
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060606"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminProviders>
          <AdminShell>{children}</AdminShell>
        </AdminProviders>
      </body>
    </html>
  );
}
