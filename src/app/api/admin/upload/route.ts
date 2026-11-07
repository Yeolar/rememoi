import { randomUUID } from 'node:crypto'

import type { NextRequest } from 'next/server'
import sharp from 'sharp'

import { requireAdmin } from '@/lib/auth-guards'
import { ensureSchema, getDb } from '@/lib/db'
import { images } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const MAX_SIZE = 8 * 1024 * 1024

export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'missing_file', message: 'Expected a file field.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: 'unsupported_type', message: 'Use JPEG, PNG, WebP, GIF or AVIF images.' },
      { status: 415 }
    )
  }
  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: 'file_too_large', message: 'Images must be smaller than 8 MB.' },
      { status: 413 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let width: number | undefined
  let height: number | undefined
  try {
    const metadata = await sharp(buffer).metadata()
    width = metadata.width
    height = metadata.height
  } catch {
    return Response.json(
      { error: 'invalid_image', message: 'The uploaded file is not a valid image.' },
      { status: 415 }
    )
  }

  const id = randomUUID()
  const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fff]+/g, '_').slice(0, 120) || 'image'

  await ensureSchema()
  await getDb().insert(images).values({
    id,
    filename: safeName,
    mimeType: file.type,
    size: file.size,
    width,
    height,
    data: new Uint8Array(buffer),
    createdAt: new Date()
  })

  return Response.json({
    data: {
      id,
      url: `/api/media/${id}`,
      width,
      height,
      filename: safeName
    }
  })
}
