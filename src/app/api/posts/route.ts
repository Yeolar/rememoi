import type { NextRequest } from 'next/server'

import { getPublishedPosts, paginate, toPostSummary } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')?.trim().toLowerCase() || undefined
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 10) || 10))

  let posts = await getPublishedPosts()
  if (tag) posts = posts.filter((post) => post.tags.includes(tag))

  const result = paginate(posts, page, limit)
  return Response.json({
    data: result.items.map(toPostSummary),
    meta: {
      page: result.currentPage,
      pageSize: result.pageSize,
      total: result.totalItems,
      totalPages: result.totalPages,
      tag: tag ?? null
    }
  })
}
