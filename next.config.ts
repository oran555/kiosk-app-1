import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "slvoqoddzatsornolkss.supabase.co",
      },
    ],
  },

  allowedDevOrigins: [
    "http://10.0.0.11",
    "http://10.0.0.11:3000",
  ],
};

export default nextConfig;