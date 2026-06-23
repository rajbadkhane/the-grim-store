import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { storefrontJsonLd } from "@/lib/seo";
import { Anton, Bebas_Neue, Hanken_Grotesk, JetBrains_Mono, Pirata_One } from "next/font/google";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

const pirataOne = Pirata_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-blackletter",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thegrimstore.com"),
  title: {
    default: "The Grim Store | Electronic Items, Kids Cameras & Game Sticks",
    template: "%s | The Grim Store"
  },
  description: "Shop electronic items, kids instant cameras, game sticks, wireless audio, grooming tools, and accessories from The Grim Store.",
  applicationName: "The Grim Store",
  keywords: [
    "The Grim Store",
    "thegrimstore.com",
    "electronic items",
    "kids camera",
    "instant print camera",
    "game stick",
    "wireless headphones",
    "grooming tools",
    "electronic accessories"
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png"
  },
  category: "electronics ecommerce",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "The Grim Store",
    title: "The Grim Store",
    description: "Electronic items, kids cameras, game sticks, audio, grooming tools, and accessories.",
    images: ["/logo.png"]
  },
  twitter: { card: "summary_large_image", title: "The Grim Store", images: ["/logo.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A"
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
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className={`${anton.variable} ${bebasNeue.variable} ${pirataOne.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} site-compact antialiased`}>
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
