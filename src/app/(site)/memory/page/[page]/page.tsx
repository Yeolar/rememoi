import { notFound } from 'next/navigation'

import { MemoryListView } from '@/components/memory/MemoryListView'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { getAllLanguages, getAllTags, getVisiblePosts, paginate } from '@/lib/posts'

type PageProps = {
  params: Promise<{ page: string }>
}

export async function generateStaticParams() {
  const posts = await getVisiblePosts()
  const totalPages = Math.max(1, Math.ceil(posts.length / siteConfig.content.memoryPageSize))
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    page: String(index + 2)
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { page } = await params
  return buildMetadata({
    title: `Memory · Page ${page}`,
    description: 'Notes, essays and experiments worth remembering.',
    path: `/memory/page/${page}`
  })
}

export default async function MemoryPageN({ params }: PageProps) {
  const { page } = await params
  const pageNumber = Number(page)
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound()

  const posts = await getVisiblePosts()
  const pagination = paginate(posts, pageNumber, siteConfig.content.memoryPageSize)
  if (pagination.currentPage !== pageNumber) notFound()

  return (
    <MemoryListView
      posts={pagination.items}
      tags={getAllTags(posts)}
      languages={getAllLanguages(posts)}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
    />
  )
}
