import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set workspace root to silence multi-lockfile warning
    root: __dirname,
  },
};

export default nextConfig;
