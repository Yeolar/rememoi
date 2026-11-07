import { MemoryListView } from '@/components/memory/MemoryListView'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { getAllLanguages, getAllTags, getVisiblePosts, paginate } from '@/lib/posts'

export const metadata = buildMetadata({
  title: 'Memory',
  description: 'Notes, essays and experiments worth remembering.',
  path: '/memory'
})

export default async function MemoryPage() {
  const posts = await getVisiblePosts()
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
