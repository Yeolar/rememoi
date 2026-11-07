import type { NextConfig } from 'next'

function cosImageHost() {
  const publicBase = process.env.COS_PUBLIC_BASE_URL?.trim()
  const bucket = process.env.COS_BUCKET?.trim()
  const region = process.env.COS_REGION?.trim()
  const raw = publicBase || (bucket && region ? `https://${bucket}.cos.${region}.myqcloud.com` : '')
  if (!raw) return null
  try {
    const url = new URL(raw)
    return { protocol: url.protocol.replace(':', '') as 'http' | 'https', hostname: url.hostname }
  } catch {
    return null
  }
}

const cosHost = cosImageHost()

const nextConfig: NextConfig = {
  // next-mdx-remote ships untranspiled ESM helpers; Turbopack needs it transpiled.
  transpilePackages: ['next-mdx-remote'],
  // Native/optional binaries must stay outside the server bundle.
  serverExternalPackages: ['@libsql/client', 'sharp', 'cos-nodejs-sdk-v5'],
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: cosHost ? [{ ...cosHost }] : []
  }
}

export default nextConfig
