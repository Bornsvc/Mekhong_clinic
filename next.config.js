/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        pg: false,
        'pg-native': false
      };
    }
    return config;
  },
  env: {
    PORT: "3001",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3001",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-secret-key"
  }
};

module.exports = nextConfig;