import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to the backend server (only in development)
  async rewrites() {
    // In production, API calls go directly to NEXT_PUBLIC_API_URL
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3003/:path*',
        },
        {
          source: '/bc/uploads/:path*',
          destination: 'http://localhost:8080/bc/uploads/:path*',
        },
      ];
    }
    return [];
  },
  
  // Allow images from production and local
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/bc/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'bareefers.org',
        pathname: '/bc/uploads/**',
      },
    ],
  },
};

export default nextConfig;
