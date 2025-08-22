import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lower memory pressure during build
  typescript: {
    // We run typecheck separately; don't block production build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip lint during production build to reduce work
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Disable JS/CSS minification to lower memory usage
    if (config.optimization) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
