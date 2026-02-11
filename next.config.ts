import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3003/api/:path*',
      },
      {
        source: '/bc/uploads/:path*',
        destination: 'http://localhost:8080/bc/uploads/:path*',
      },
    ];
  },
  
  // Allow images from the uploads directory
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/bc/uploads/**',
      },
    ],
  },
};

export default nextConfig;
