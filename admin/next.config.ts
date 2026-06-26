import type { NextConfig } from "next";

const apiProxyTarget = (process.env.API_PROXY_URL ?? process.env.API_URL ?? "http://localhost:5000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ],
    formats: ["image/avif", "image/webp"]
  },
  experimental: { optimizePackageImports: ["lucide-react", "recharts", "framer-motion"] }
};

export default nextConfig;
