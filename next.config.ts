import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  allowedDevOrigins: [
    '.trycloudflare.com',
    'localhost:3000',
  ],
};

export default nextConfig;
