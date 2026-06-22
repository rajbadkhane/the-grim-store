import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { storefrontJsonLd } from "@/lib/seo";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thegrimstore.com"),
  title: {
    default: "The Grim Store | Premium Smart Toys & Electronics",
    template: "%s | The Grim Store"
  },
  description: "Premium kids smart toys, educational gadgets, gaming consoles, wearables, and electronics designed for modern families.",
  applicationName: "The Grim Store",
  keywords: [
    "The Grim Store",
    "thegrimstore.com",
    "kids smart toys",
    "educational gadgets",
    "gaming consoles",
    "wearables",
    "electronics ecommerce store",
    "premium electronics"
  ],
  alternates: { canonical: "/" },
  category: "electronics ecommerce",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "The Grim Store",
    title: "The Grim Store",
    description: "Premium smart toys, gaming gadgets, and electronics.",
    images: ["/og-image.jpg"]
  },
  twitter: { card: "summary_large_image", title: "The Grim Store" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAFA"
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
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storefrontJsonLd()) }} />
        <Providers>
          <Header />
          <main className="w-full flex-grow">{children}</main>
          <Footer />
          <LoginModal />
          <FlyCartContainer />
        </Providers>
      </body>
    </html>
  );
}
