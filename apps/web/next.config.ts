import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@happi/config',
    '@happi/types',
    '@happi/ui',
    '@happi/utils',
    '@happi/validation',
  ],
}

export default nextConfig
