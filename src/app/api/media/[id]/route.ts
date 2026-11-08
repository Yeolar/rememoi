import { eq } from 'drizzle-orm'

import { ensureSchema, getDb } from '@/lib/db'
import { images } from '@/lib/db/schema'
import { getCosObject, MediaStorageError } from '@/lib/media-storage'

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
      const object = await getCosObject(row.storageKey)
      return new Response(new Uint8Array(object.body), {
        headers: {
          'Content-Type': row.mimeType,
          'Content-Length': String(row.size),
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...(object.etag ? { ETag: object.etag } : {})
        }
      })
    } catch (error) {
      if (error instanceof MediaStorageError) {
        return new Response(error.message, { status: error.status })
      }
      const code = (error as { code?: string }).code
      const status = (error as { statusCode?: number }).statusCode
      if (code === 'NoSuchKey' || status === 404) {
        return new Response('Not found', { status: 404 })
      }
      console.error(`[media] COS read failed: ${error instanceof Error ? error.message : 'unknown error'}`)
      return new Response('Media storage error', { status: 502 })
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
