import { PostPreview } from '@/components/content/PostPreview'
import { Button } from '@/components/ui/Button'
import { Paginator } from '@/components/ui/Paginator'
import { getLanguageLabel } from '@/lib/languages'
import { paginationProps } from '@/lib/pagination'
import type { Post } from '@/types'

type LanguagePostListProps = {
  language: string
  posts: Post[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export function LanguagePostList({
  language,
  posts,
  currentPage,
  totalPages,
  totalItems
}: LanguagePostListProps) {
  const basePath = `/blog/language/${encodeURIComponent(language)}`
  const pagination = paginationProps(basePath, currentPage, totalPages, {
    prev: '← Previous Posts',
    next: 'Next Posts →'
  })
  const label = getLanguageLabel(language)

  return (
    <>
      <Button title='Back' href='/blog' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 mt-6 flex flex-wrap items-end gap-x-2 text-3xl font-medium sm:mt-10'>
            Language: <span className='text-2xl'>{label}</span>
            <span className='text-sm font-normal text-muted-foreground'>{language}</span>
          </h1>
          <p className='mb-6 text-sm text-muted-foreground'>
            {totalItems} post{totalItems === 1 ? '' : 's'} in this language
          </p>
        </div>

        <section id='content' className='animate' aria-label='Blog post list'>
          {posts.length === 0 ? (
            <p>No posts in this language yet.</p>
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
