import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { storefrontJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thegrimstore.com"),
  title: {
    default: "The Grim Store | Premium Electronics Ecommerce",
    template: "%s | The Grim Store"
  },
  description: "Premium electronics, smart gadgets, secure checkout, live delivery tracking, and a futuristic dark-mode shopping experience.",
  applicationName: "The Grim Store",
  keywords: [
    "The Grim Store",
    "thegrimstore.com",
    "the grim store",
    "the grimstore",
    "premium electronics",
    "buy smart gadgets online",
    "wireless gadgets",
    "electronics ecommerce store",
    "Razorpay secure orders",
    "track order The Grim Store",
    "official the grim store website"
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storefrontJsonLd()) }} />
        <Providers>
          <Header />
          <main className="pb-16 lg:pb-0">{children}</main>
          <Footer />
          <LoginModal />
          <FlyCartContainer />
        </Providers>
      </body>
    </html>
  );
}
