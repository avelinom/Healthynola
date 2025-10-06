/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Use production URLs in Vercel, localhost otherwise
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
      (process.env.VERCEL ? 'https://healthynola-backend.onrender.com/api' : 'http://localhost:3001/api'),
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 
      (process.env.VERCEL ? 'https://healthynola-backend.onrender.com' : 'http://localhost:3001')
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  }
};

module.exports = nextConfig;
