import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.usernames.app-backend.toolsforhumanity.com',
      },
      {
        protocol: 'https',
        hostname: 'uvfyaykcpsggbabxbuzb.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  allowedDevOrigins: ['*'],
  reactStrictMode: false,
};

export default nextConfig;
