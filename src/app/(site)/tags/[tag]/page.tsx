import { notFound } from 'next/navigation'

import { TagPostList } from '@/components/blog/TagPostList'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { safeDecode } from '@/lib/pagination'
import { getAllTags, getPostsByTag, getVisiblePosts, paginate } from '@/lib/posts'

type TagPageProps = {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  const tags = getAllTags(await getVisiblePosts())
  return tags.map(([tag]) => ({ tag }))
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params
  const decoded = safeDecode(tag)
  return buildMetadata({
    title: `Tag: ${decoded}`,
    description: `View all posts with the tag - ${decoded}`,
    path: `/tags/${encodeURIComponent(decoded)}`
  })
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decoded = safeDecode(tag)
  const posts = await getPostsByTag(decoded)
  if (posts.length === 0) notFound()

  const pagination = paginate(posts, 1, siteConfig.content.blogPageSize)

  return (
    <TagPostList
      tag={decoded}
      posts={pagination.items}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
    />
  )
}
