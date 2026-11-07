import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/auth-guards'
import { deleteAdminPost, getAdminPost, updateAdminPost } from '@/lib/admin-posts'
import { revalidatePublicSite } from '@/lib/revalidate'
import { formatZodError, postUpdateSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await params
  const post = await getAdminPost(id)
  if (!post) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json({ data: post })
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = postUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'validation_error', issues: formatZodError(parsed.error) },
      { status: 422 }
    )
  }

  const post = await updateAdminPost(id, parsed.data)
  if (!post) return Response.json({ error: 'not_found' }, { status: 404 })
  revalidatePublicSite()
  return Response.json({ data: post })
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await params
  const deleted = await deleteAdminPost(id)
  if (!deleted) return Response.json({ error: 'not_found' }, { status: 404 })
  revalidatePublicSite()
  return Response.json({ ok: true })
}
