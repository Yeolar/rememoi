import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // next-mdx-remote ships untranspiled ESM helpers; Turbopack needs it transpiled.
  transpilePackages: ['next-mdx-remote'],
  // Native/optional binaries must stay outside the server bundle.
  serverExternalPackages: ['@libsql/client', 'sharp'],
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp']
  }
}

export default nextConfig
