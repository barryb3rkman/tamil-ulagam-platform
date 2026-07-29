import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  compress: true,
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@tamil-ulagam/shared", "@tamil-ulagam/ui"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
