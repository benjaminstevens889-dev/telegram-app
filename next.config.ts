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
  // Set security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https: wss: ws:; media-src 'self' https: blob: data:; object-src 'none'; frame-src 'self' https:;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
