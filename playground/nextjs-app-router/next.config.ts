import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@storyblok/react'],
  turbopack: {
    resolveAlias: {
      '@storyblok/react': '../../packages/react/dist/index.js',
      '@storyblok/react/client': '../../packages/react/dist/client.js',
    },
  },
};

export default nextConfig;
