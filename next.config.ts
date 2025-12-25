import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Ignore viem dependency type errors during build
    ignoreBuildErrors: true,
  },
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
