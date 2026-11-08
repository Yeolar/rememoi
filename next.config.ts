import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Emit a self-contained `.next/standalone` server with only the traced modules,
  // so the runtime image does not need pnpm or devDependencies.
  output: 'standalone',
  // next-mdx-remote ships untranspiled ESM helpers; Turbopack needs it transpiled.
  transpilePackages: ['next-mdx-remote'],
  // Native/optional binaries must stay outside the server bundle.
  serverExternalPackages: ['@libsql/client', 'sharp', 'cos-nodejs-sdk-v5'],
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp']
  }
}

export default nextConfig
