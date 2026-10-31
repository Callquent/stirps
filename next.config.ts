import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Les photos passent par une Server Action : on relève la limite par défaut (1 Mo)
    // pour permettre l'envoi de plusieurs photos de téléphone à la fois.
    serverActions: { bodySizeLimit: "60mb" },
  },
};

export default nextConfig;
