import { PostPreview } from '@/components/content/PostPreview'
import { Trans } from '@/components/i18n/Trans'
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
    prev: <Trans en='← Previous Tags' zh='← 上一页标签' />,
    next: <Trans en='Next Tags →' zh='下一页标签 →' />
  })

  return (
    <>
      <Button title={<Trans en='Back' zh='返回' />} href='/blog' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 mt-6 flex items-end gap-x-2 text-3xl font-medium sm:mt-10'>
            <Trans en='Tags:' zh='标签：' /> <span className='text-2xl'>#{tag}</span>
          </h1>
        </div>

        <section id='content' className='animate' aria-label='Blog post list'>
          {posts.length === 0 ? (
            <p><Trans en='No posts with this tag yet.' zh='该标签下暂无文章。' /></p>
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
