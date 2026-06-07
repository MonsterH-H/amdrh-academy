import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles builds natively — no standalone output needed
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
