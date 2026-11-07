import { randomUUID } from 'node:crypto'

import type { NextRequest } from 'next/server'
import sharp from 'sharp'

import { requireAdmin } from '@/lib/auth-guards'
import { ensureSchema, getDb } from '@/lib/db'
import { images } from '@/lib/db/schema'
import { deleteMediaObject, MediaStorageError, storeMedia } from '@/lib/media-storage'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const MAX_SIZE = 8 * 1024 * 1024

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
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

  let stored
  try {
    stored = await storeMedia({ id, bytes: buffer, mimeType: file.type, filename: safeName })
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return Response.json(
        { error: error.code, message: error.message },
        { status: error.status }
      )
    }
    throw error
  }

  await ensureSchema()
  try {
    await getDb().insert(images).values({
      id,
      filename: safeName,
      mimeType: file.type,
      size: file.size,
      width,
      height,
      // COS-backed rows keep an empty blob; the bytes live at storageKey.
      data: stored.storage === 'db' ? new Uint8Array(buffer) : new Uint8Array(0),
      storage: stored.storage,
      storageKey: stored.storageKey,
      createdAt: new Date()
    })
  } catch (error) {
    await deleteMediaObject(stored.storage, stored.storageKey).catch((cleanupError) => {
      const message = cleanupError instanceof Error ? cleanupError.message : 'unknown error'
      console.error(`[media] failed to clean up an orphaned object: ${message}`)
    })
    throw error
  }

  return Response.json({
    data: {
      id,
      url: stored.url,
      width,
      height,
      filename: safeName,
      storage: stored.storage
    }
  })
}
