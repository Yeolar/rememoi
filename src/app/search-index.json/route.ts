import { getPublishedPosts } from '@/lib/posts'
import type { SearchDocument } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await getPublishedPosts()
  const documents: SearchDocument[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    language: post.language,
    headings: post.headings.map((heading) => heading.text),
    content: post.plainText.slice(0, 20000),
    publishDate: post.publishDateISO,
    updatedDate: post.updatedDateISO
  }))

  return Response.json(documents, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}
