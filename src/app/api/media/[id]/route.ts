import { eq } from 'drizzle-orm'

import { ensureSchema, getDb } from '@/lib/db'
import { images } from '@/lib/db/schema'
import { MediaStorageError, mediaPublicUrl } from '@/lib/media-storage'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  await ensureSchema()
  const [row] = await getDb().select().from(images).where(eq(images.id, id)).limit(1)
  if (!row) return new Response('Not found', { status: 404 })

  if (row.storage === 'cos') {
    if (!row.storageKey) return new Response('Not found', { status: 404 })
    try {
      return new Response(null, {
        status: 307,
        headers: {
          Location: mediaPublicUrl(row.storageKey),
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      })
    } catch (error) {
      if (error instanceof MediaStorageError) {
        return new Response(error.message, { status: error.status })
      }
      throw error
    }
  }

  const raw = row.data as unknown
  const bytes =
    raw instanceof ArrayBuffer
      ? new Uint8Array(raw)
      : raw instanceof Uint8Array
        ? raw
        : new Uint8Array(raw as ArrayBufferLike)

  return new Response(bytes as BodyInit, {
    headers: {
      'Content-Type': row.mimeType,
      'Content-Length': String(row.size),
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
