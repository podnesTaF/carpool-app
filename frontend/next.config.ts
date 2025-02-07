import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    domains: [
      "cdn.pixabay.com",
      "www.carlogos.org",
      "localhost",
      "storage.googleapis.com",
    ],
  },
};

export default nextConfig;
