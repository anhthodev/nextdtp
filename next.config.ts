import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * Optimized for performance on Mac Mini 8GB
 */
const nextConfig: NextConfig = {
  // Compression and optimization
  compress: true,

  // Image optimization
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 30,

  // Turbopack optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
    ],
  },
};

export default nextConfig;
