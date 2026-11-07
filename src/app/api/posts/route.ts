import type { NextRequest } from 'next/server'

import { createAdminPost } from '@/lib/admin-posts'
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages'
import { requireAdmin } from '@/lib/auth-guards'
import { getPublishedPosts, paginate, toPostSummary } from '@/lib/posts'
import { revalidatePublicSite } from '@/lib/revalidate'
import { formatZodError, postInputSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/** Public post list. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')?.trim().toLowerCase() || undefined
  const languageParam = searchParams.get('language')?.trim() || undefined
  const language = languageParam ? normalizeLanguage(languageParam) : undefined
  if (languageParam && !language) {
    return Response.json(
      {
        error: 'invalid_language',
        message: `Unsupported language. Use one of: ${LANGUAGE_CODES.join(', ')}.`
      },
      { status: 400 }
    )
  }

  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 10) || 10))

  let posts = await getPublishedPosts()
  if (tag) posts = posts.filter((post) => post.tags.includes(tag))
  if (language) posts = posts.filter((post) => normalizeLanguage(post.language) === language)

  const result = paginate(posts, page, limit)
  return Response.json({
    data: result.items.map(toPostSummary),
    meta: {
      page: result.currentPage,
      pageSize: result.pageSize,
      total: result.totalItems,
      totalPages: result.totalPages,
      tag: tag ?? null,
      language: language ?? null
    }
  })
}

/**
 * Create a post. Requires an admin session or `Authorization: Bearer
 * <REMEMOI_API_TOKEN>`.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
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
