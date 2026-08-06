import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";

if (basePath && (!basePath.startsWith("/") || basePath.endsWith("/"))) {
  throw new Error(
    "NEXT_PUBLIC_BASE_PATH must be empty or start with one slash and omit the trailing slash.",
  );
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  basePath: basePath || undefined,
  compress: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  output: "export",
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  transpilePackages: ["@tamil-ulagam/shared", "@tamil-ulagam/ui"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
