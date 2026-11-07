import Link from 'next/link'

import { Trans } from '@/components/i18n/Trans'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { buildMetadata } from '@/lib/metadata'
import { getAllTags, getVisiblePosts } from '@/lib/posts'

export const metadata = buildMetadata({
  title: 'All Tags',
  description: "A list of all the topics I've written about in my posts",
  path: '/tags'
})

export default async function TagsPage() {
  const posts = await getVisiblePosts()
  const tags = getAllTags(posts)

  return (
    <>
      <Button title={<Trans en='Back' zh='返回' />} href='/blog' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 text-3xl font-medium'><Trans en='Tags' zh='标签' /></h1>
        </div>

        <div id='content' className='animate'>
          {tags.length > 0 ? (
            <ul className='flex flex-wrap gap-4'>
              {tags.map(([tag, count]) => (
                <li key={tag}>
                  <Button
                    href={`/tags/${encodeURIComponent(tag)}`}
                    variant='pill'
                    className={cn(
                      'items-start gap-x-1',
                      count > 2 ? 'rounded-xl px-3 py-1 text-xl' : count > 1 && 'text-lg'
                    )}
                  >
                    {tag}
                    <span className={count > 2 ? 'text-base' : 'text-xs'}>{count}</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p><Trans en='No tags yet.' zh='暂无标签。' /></p>
          )}
        </div>

        <p className='mt-8 text-sm text-muted-foreground'>
          <Trans en='Looking for something else? Browse the ' zh='想看别的？前往' />
          <Link href='/archives'><Trans en='complete archive' zh='完整归档' /></Link>
          <Trans en='.' zh='。' />
        </p>
      </main>
    </>
  )
}
