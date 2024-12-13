import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "www.bungie.net",
        pathname: "/img/destiny_content/pgcr/*",
      },
    ],
  },
};

export default nextConfig;
