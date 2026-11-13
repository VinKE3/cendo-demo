/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.BUILD_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

