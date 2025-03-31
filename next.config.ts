// next.config.js หรือ next.config.ts (ถ้าใช้ TypeScript)
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config, { isServer }: { isServer: boolean }) {
    // เช็คว่าเป็นฝั่ง server หรือ client
    if (!isServer) {
      // ในฝั่ง client ให้กำหนด fs เป็นโมดูลว่าง
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
