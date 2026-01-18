import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zwwtvrszllmgbbppzhdf.supabase.co",
      },
    ],
  },
};

export default nextConfig;
