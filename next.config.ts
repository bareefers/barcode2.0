import path from "path";
import type { NextConfig } from "next";

const uploadsBase =
  process.env.NEXT_PUBLIC_UPLOADS_ORIGIN || "https://bareefers.org";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted in `client/` so monorepo lockfiles do not confuse Next.
  turbopack: {
    root: path.join(__dirname),
  },

  // Proxy uploads: dev → local nginx; prod (Vercel) → forum so `/bc/uploads/*` image URLs work.
  async rewrites() {
    const uploadRewrite = {
      source: "/bc/uploads/:path*" as const,
      destination:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8080/bc/uploads/:path*"
          : `${uploadsBase.replace(/\/$/, "")}/bc/uploads/:path*`,
    };
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:3003/:path*",
        },
        uploadRewrite,
      ];
    }
    return [uploadRewrite];
  },

  // Allow images from production and local
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/bc/uploads/**",
      },
      {
        protocol: "https",
        hostname: "bareefers.org",
        pathname: "/bc/uploads/**",
      },
    ],
  },
};

export default nextConfig;
