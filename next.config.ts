import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "assets.quizkuy.id" },
      { protocol: "https", hostname: "api-quiz.hompimpa.biz.id" },
      { protocol: "https", hostname: "moeda-space.s3.ap-southeast-1.amazonaws.com" },
      { protocol: "https", hostname: "pub-6cdb83741198489c89f54cff08d7d1c7.r2.dev" },
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
