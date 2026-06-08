import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { storefrontJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "The Grim Store | Premium Streetwear Ecommerce",
    template: "%s | The Grim Store"
  },
  description: "Premium black and red streetwear, graphic fashion, limited drops, fast checkout, verified reviews, and conversion-focused shopping.",
  applicationName: "The Grim Store",
  keywords: ["The Grim Store", "premium streetwear", "oversized tees", "hoodies", "limited fashion drops", "graphic streetwear"],
  alternates: { canonical: "/" },
  category: "fashion ecommerce",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "The Grim Store",
    title: "The Grim Store",
    description: "Premium streetwear ecommerce for modern fashion drops.",
    images: ["/og-image.jpg"]
  },
  twitter: { card: "summary_large_image", title: "The Grim Store" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070707"
};

import { LoginModal } from "@/components/layout/login-modal";
import { FlyCartContainer } from "@/components/home/fly-cart-container";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
