import { MemoryListView } from '@/components/memory/MemoryListView'
import siteConfig from '@/config/site'
import { canViewPrivatePosts } from '@/lib/auth-guards'
import { buildMetadata } from '@/lib/metadata'
import { getAllLanguages, getAllTags, getVisiblePosts, paginate } from '@/lib/posts'

export const metadata = buildMetadata({
  title: 'Memory',
  description: 'Notes, essays and experiments worth remembering.',
  path: '/memory'
})

export default async function MemoryPage() {
  const includePrivate = await canViewPrivatePosts()
  const posts = await getVisiblePosts({ includePrivate })
  const tags = getAllTags(posts)
  const pagination = paginate(posts, 1, siteConfig.content.memoryPageSize)

  return (
    <MemoryListView
      posts={pagination.items}
      tags={tags}
      languages={getAllLanguages(posts)}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
    />
  )
}
