/** @type {import('next').NextConfig} */

process.env.NEXT_TELEMETRY_DISABLED = '1';

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
