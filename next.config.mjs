/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/webhook': ['./data/responses.csv'],
    },
  },
  webpack: (config) => {
    config.externals = [...config.externals, "@line/bot-sdk"];
    return config;
  },
}

export default nextConfig
