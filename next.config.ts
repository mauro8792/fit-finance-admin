import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Backoffice web - NO es PWA
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
