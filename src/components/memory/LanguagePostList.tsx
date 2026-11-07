import { PostPreview } from '@/components/content/PostPreview'
import { Trans } from '@/components/i18n/Trans'
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
  const basePath = `/memory/language/${encodeURIComponent(language)}`
  const pagination = paginationProps(basePath, currentPage, totalPages, {
    prev: <Trans en='← Previous entries' zh='← 上一页' />,
    next: <Trans en='Next entries →' zh='下一页' />
  })
  const label = getLanguageLabel(language)

  return (
    <>
      <Button title={<Trans en='Back' zh='返回' />} href='/memory' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 mt-6 flex flex-wrap items-end gap-x-2 text-3xl font-medium sm:mt-10'>
            <Trans en='Language:' zh='语言：' /> <span className='text-2xl'>{label}</span>
            <span className='text-sm font-normal text-muted-foreground'>{language}</span>
          </h1>
          <p className='mb-6 text-sm text-muted-foreground'>
            <Trans
              en={`${totalItems} post${totalItems === 1 ? '' : 's'} in this language`}
              zh={`该语言共 ${totalItems} 篇文章`}
            />
          </p>
        </div>

        <section id='content' className='animate' aria-label='Memory entries list'>
          {posts.length === 0 ? (
            <p><Trans en='No posts in this language yet.' zh='该语言暂无文章。' /></p>
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
