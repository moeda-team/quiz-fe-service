import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  env: {
    API_URL: process.env.API_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: "ewRIt60+sOt9bud3z8SrMQp0gh4eBTyiO7iYXpvoHVk=",
  },
  poweredByHeader: false,
};

export default nextConfig;
