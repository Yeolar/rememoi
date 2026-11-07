import type { NextRequest } from 'next/server'

import { updateAdminPost } from '@/lib/admin-posts'
import { requireAdmin } from '@/lib/auth-guards'
import { safeDecode } from '@/lib/pagination'
import { getPostBySlug, getPublishedPostBySlug } from '@/lib/posts'
import { revalidatePublicSite } from '@/lib/revalidate'
import { formatZodError, postUpdateSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ slug: string[] }>
}

/** Public post detail. Drafts stay hidden from unauthenticated callers. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug.map(safeDecode).join('/'))
  if (!post) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json({ data: post })
}

/**
 * Partially update a post by slug. Requires an admin session or
 * `Authorization: Bearer <REMEMOI_API_TOKEN>`.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin(request)
  if ('error' in guard) return guard.error

  const { slug } = await params
  const post = await getPostBySlug(slug.map(safeDecode).join('/'), { includePrivate: true })
  if (!post) return Response.json({ error: 'not_found' }, { status: 404 })

  const body = await request.json().catch(() => null)
  const parsed = postUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'validation_error', issues: formatZodError(parsed.error) },
      { status: 422 }
    )
  }

  const updated = await updateAdminPost(post.id, parsed.data)
  if (!updated) return Response.json({ error: 'not_found' }, { status: 404 })

  revalidatePublicSite()
  return Response.json({ data: updated })
}
