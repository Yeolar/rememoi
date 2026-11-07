import { BlogListView } from '@/components/blog/BlogListView'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { getAllLanguages, getAllTags, getVisiblePosts, paginate } from '@/lib/posts'

export const metadata = buildMetadata({
  title: 'Blog',
  description: 'Notes, essays and experiments worth remembering.',
  path: '/blog'
})

export default async function BlogPage() {
  const posts = await getVisiblePosts()
  const tags = getAllTags(posts)
  const pagination = paginate(posts, 1, siteConfig.content.blogPageSize)

  return (
    <BlogListView
      posts={pagination.items}
      tags={tags}
      languages={getAllLanguages(posts)}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
    />
  )
}
