import { getPublishedPostBySlug } from '@/lib/posts'
import { safeDecode } from '@/lib/pagination'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ slug: string[] }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug.map(safeDecode).join('/'))
  if (!post) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json({ data: post })
}
