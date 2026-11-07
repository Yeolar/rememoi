import { notFound } from 'next/navigation'

import { TagPostList } from '@/components/memory/TagPostList'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { safeDecode } from '@/lib/pagination'
import { getAllTags, getPostsByTag, getVisiblePosts, paginate } from '@/lib/posts'

type TagPageProps = {
  params: Promise<{ tag: string; page: string }>
}

export async function generateStaticParams() {
  const posts = await getVisiblePosts()
  const tags = getAllTags(posts)
  return tags.flatMap(([tag]) => {
    const tagPosts = posts.filter((post) => post.tags.includes(tag))
    const totalPages = Math.max(1, Math.ceil(tagPosts.length / siteConfig.content.memoryPageSize))
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
      tag,
      page: String(index + 2)
    }))
  })
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag, page } = await params
  const decoded = safeDecode(tag)
  return buildMetadata({
    title: `Tag: ${decoded} · Page ${page}`,
    description: `View all posts with the tag - ${decoded}`,
    path: `/tags/${encodeURIComponent(decoded)}/page/${page}`
  })
}

export default async function TagPageN({ params }: TagPageProps) {
  const { tag, page } = await params
  const decoded = safeDecode(tag)
  const pageNumber = Number(page)
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound()

  const posts = await getPostsByTag(decoded)
  if (posts.length === 0) notFound()

  const pagination = paginate(posts, pageNumber, siteConfig.content.memoryPageSize)
  if (pagination.currentPage !== pageNumber) notFound()

  return (
    <TagPostList
      tag={decoded}
      posts={pagination.items}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
    />
  )
}
