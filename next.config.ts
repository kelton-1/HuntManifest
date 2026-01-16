import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:5000',
    '*.replit.dev',
    '*.repl.co',
    '*.kirk.replit.dev',
  ],
};

export default nextConfig;
