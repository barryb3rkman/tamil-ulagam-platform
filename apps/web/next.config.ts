import type { NextConfig } from "next";

const isBrowserValidation = process.env.TAMIL_ULAGAM_E2E === "1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  compress: true,
  devIndicators: false,
  images: {
    unoptimized: isBrowserValidation,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@tamil-ulagam/shared", "@tamil-ulagam/ui"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
