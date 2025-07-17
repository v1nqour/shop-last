/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/diyxe4o4g/**",
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  serverExternalPackages: ['@prisma/client', 'bcrypt', '@neondatabase/serverless'],
  // Enable proper RSC routing
  async rewrites() {
    return [
      {
        source: '/search:_rsc',
        destination: '/api/search', // Or your actual search endpoint
      }
    ]
  }
};

export default nextConfig;