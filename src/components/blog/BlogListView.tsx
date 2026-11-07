import Link from 'next/link'

import { PostPreview } from '@/components/content/PostPreview'
import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { Paginator } from '@/components/ui/Paginator'
import { getLanguageLabel } from '@/lib/languages'
import { pageUrl, paginationProps } from '@/lib/pagination'
import type { Post } from '@/types'

type BlogListViewProps = {
  posts: Post[]
  tags: Array<[string, number]>
  languages: Array<[string, number]>
  currentPage: number
  totalPages: number
  totalItems: number
}

export function BlogListView({
  posts,
  tags,
  languages,
  currentPage,
  totalPages,
  totalItems
}: BlogListViewProps) {
  const pagination = paginationProps('/blog', currentPage, totalPages, {
    prev: <Trans en='← Previous Posts' zh='← 上一页文章' />,
    next: <Trans en='Next Posts →' zh='下一页文章 →' />
  })

  return (
    <>
      <Button title={<Trans en='Back' zh='返回' />} href='/' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 mt-6 text-3xl font-medium sm:mt-10'><Trans en='Blog' zh='博客' /></h1>
        </div>

        {posts.length === 0 ? (
          <p><Trans en='No posts yet.' zh='暂无文章。' /></p>
        ) : (
          <div className='grid gap-y-16 sm:grid-cols-[3fr_1fr] sm:gap-x-8'>
            <section aria-label='Blog posts list' className='animate' id='content'>
              <div className='mb-3 flex flex-col justify-between text-sm sm:mb-5 sm:flex-row'>
                <span className='text-muted-foreground'>
                  <Trans
                    en={`Page ${currentPage} - Showing ${posts.length} of ${totalItems} post${totalItems === 1 ? '' : 's'}`}
                    zh={`第 ${currentPage} 页 · 显示 ${posts.length} / ${totalItems} 篇文章`}
                  />
                </span>
                <Link aria-label='View all blog by years' href='/archives'>
                  <Trans en='View all posts by years →' zh='按年份查看全部文章 →' />
                </Link>
              </div>
              <ul className='flex flex-col gap-y-4 text-start'>
                {posts.map((post) => (
                  <PostPreview key={post.id} post={post} detailed />
                ))}
              </ul>
              <Paginator {...pagination} />
            </section>

            {(tags.length > 0 || languages.length > 0) && (
              <aside className='animate' id='sidebar'>
                {tags.length > 0 && (
                  <>
                    <h2 className='mb-4 flex items-center text-lg font-medium'>
                      <Icon name='tag-2' className='me-2' />
                      <Trans en='Tags' zh='标签' />
                    </h2>
                    <ul className='flex flex-wrap gap-2'>
                      {tags.slice(0, 50).map(([tag]) => (
                        <li key={tag}>
                          <Button title={tag} href={`/tags/${encodeURIComponent(tag)}`} variant='pill' />
                        </li>
                      ))}
                    </ul>
                    <span className='mt-4 block sm:text-end'>
                      <Link aria-label='View all blog categories' href='/tags'>
                        <Trans en='View all →' zh='查看全部 →' />
                      </Link>
                    </span>
                  </>
                )}

                {languages.length > 0 && (
                  <div className={tags.length > 0 ? 'mt-8' : ''}>
                    <h2 className='mb-4 flex items-center text-lg font-medium'>
                      <Icon name='earth' className='me-2' />
                      <Trans en='Languages' zh='语言' />
                    </h2>
                    <ul className='flex flex-wrap gap-2'>
                      {languages.map(([language, count]) => (
                        <li key={language}>
                          <Button
                            title={`${getLanguageLabel(language)} (${count})`}
                            href={`/blog/language/${encodeURIComponent(language)}`}
                            variant='pill'
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export { pageUrl }
