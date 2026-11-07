import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/auth-guards'
import { createAdminPost, listAdminPosts } from '@/lib/admin-posts'
import { revalidatePublicSite } from '@/lib/revalidate'
import { formatZodError, postInputSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error
  const data = await listAdminPosts()
  return Response.json({ data })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = postInputSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'validation_error', issues: formatZodError(parsed.error) },
      { status: 422 }
    )
  }

  const post = await createAdminPost(parsed.data)
  revalidatePublicSite()
  return Response.json({ data: post }, { status: 201 })
}
