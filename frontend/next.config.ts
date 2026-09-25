import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: 'tsconfig.json',
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
