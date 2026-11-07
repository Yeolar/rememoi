import { PostPreview } from '@/components/content/PostPreview'
import { Button } from '@/components/ui/Button'
import { Paginator } from '@/components/ui/Paginator'
import { paginationProps } from '@/lib/pagination'
import type { Post } from '@/types'

type TagPostListProps = {
  tag: string
  posts: Post[]
  currentPage: number
  totalPages: number
}

export function TagPostList({ tag, posts, currentPage, totalPages }: TagPostListProps) {
  const basePath = `/tags/${encodeURIComponent(tag)}`
  const pagination = paginationProps(basePath, currentPage, totalPages, {
    prev: '← Previous Tags',
    next: 'Next Tags →'
  })

  return (
    <>
      <Button title='Back' href='/blog' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 mt-6 flex items-end gap-x-2 text-3xl font-medium sm:mt-10'>
            Tags: <span className='text-2xl'>#{tag}</span>
          </h1>
        </div>

        <section id='content' className='animate' aria-label='Blog post list'>
          {posts.length === 0 ? (
            <p>No posts with this tag yet.</p>
          ) : (
            <ul className='flex flex-col gap-y-3 text-start'>
              {posts.map((post) => (
                <PostPreview key={post.id} post={post} detailed />
              ))}
            </ul>
          )}
          <Paginator {...pagination} />
        </section>
      </main>
    </>
  )
}
