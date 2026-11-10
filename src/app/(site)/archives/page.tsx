import { PostPreview } from '@/components/content/PostPreview'
import { Trans } from '@/components/i18n/Trans'
import { Button } from '@/components/ui/Button'
import { canViewPrivatePosts } from '@/lib/auth-guards'
import { buildMetadata } from '@/lib/metadata'
import { getVisiblePosts, groupPostsByYear } from '@/lib/posts'

export const metadata = buildMetadata({
  title: 'Archives',
  description: 'A list of all the years of creating my posts',
  path: '/archives'
})

export default async function ArchivesPage() {
  const includePrivate = await canViewPrivatePosts()
  const posts = await getVisiblePosts({ includePrivate })
  const byYear = groupPostsByYear(posts)

  return (
    <>
      <Button title={<Trans en='Back' zh='返回' />} href='/memory' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 text-3xl font-medium'><Trans en='Archives' zh='归档' /></h1>
        </div>

        {posts.length === 0 && <p><Trans en='No posts yet.' zh='暂无文章。' /></p>}

        <section id='content' className='animate' aria-label='Memory entries list'>
          {byYear.map(([year, yearPosts]) => (
            <div key={year} className='relative mt-20'>
              <h2
                className='absolute -start-6 -top-16 z-0 text-9xl font-bold text-transparent opacity-[0.12] dark:opacity-25'
                style={{
                  WebkitTextStrokeWidth: '2px',
                  WebkitTextStrokeColor: 'hsl(var(--foreground))'
                }}
              >
                <samp>{year}</samp>
              </h2>
              <p className='px-5 text-muted-foreground'>
                <Trans
                  en={`${yearPosts.length} post${yearPosts.length > 1 ? 's' : ''}`}
                  zh={`${yearPosts.length} 篇文章`}
                />
              </p>
              <ul className='flex flex-col text-start'>
                {yearPosts.map((post) => (
                  <PostPreview key={post.id} post={post} className='border-0 bg-transparent py-2' />
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
