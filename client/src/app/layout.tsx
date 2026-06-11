import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { storefrontJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "The Grim Store | Premium Electronics Ecommerce",
    template: "%s | The Grim Store"
  },
  description: "Premium electronics, smart gadgets, secure checkout, live delivery tracking, and a futuristic dark-mode shopping experience.",
  applicationName: "The Grim Store",
  keywords: ["The Grim Store", "premium electronics", "gadgets", "smart devices", "wireless accessories", "electronics ecommerce"],
  alternates: { canonical: "/" },
  category: "electronics ecommerce",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "The Grim Store",
    title: "The Grim Store",
    description: "Premium electronics ecommerce for modern gadget shoppers.",
    images: ["/og-image.jpg"]
  },
  twitter: { card: "summary_large_image", title: "The Grim Store" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050816"
};

import { LoginModal } from "@/components/layout/login-modal";
import { FlyCartContainer } from "@/components/home/fly-cart-container";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storefrontJsonLd()) }} />
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <LoginModal />
          <FlyCartContainer />
        </Providers>
      </body>
    </html>
  );
}
