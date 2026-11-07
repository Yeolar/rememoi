import { CopyableValue } from '@/components/links/CopyableValue'
import { FriendList } from '@/components/links/FriendList'
import { Toc } from '@/components/content/Toc'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { Collapse } from '@/components/mdx/Collapse'
import { Timeline } from '@/components/mdx/Timeline'
import { applyTip, friendLists, linkLogbook } from '@/config/links'
import { buildMetadata } from '@/lib/metadata'
import type { Heading } from '@/types'

export const metadata = buildMetadata({
  title: 'Links',
  description: 'A small collection of sites, tools and people I like.',
  path: '/links'
})

const headings: Heading[] = [
  { depth: 2, slug: 'common-links', text: 'Common Links' },
  { depth: 2, slug: 'special-links', text: 'Special Links' },
  { depth: 2, slug: 'apply-links', text: 'Apply Links' }
]

export default function LinksPage() {
  const [common, special] = friendLists

  return (
    <ContentLayout
      backHref='/'
      sidebar={<Toc headings={headings} />}
      header={<h1 className='text-2xl font-medium sm:mb-2 sm:text-3xl'>Links</h1>}
    >
      <p>They&apos;re sorted randomly, more or less.</p>

      <h2 id='common-links'>Common Links</h2>
      <FriendList list={common} />

      <Collapse title='Link History Book'>
        <Timeline events={linkLogbook} />
      </Collapse>

      <h2 id='special-links'>Special Links</h2>
      <FriendList list={special} />

      <h2 id='apply-links'>Apply Links</h2>
      <p>本站信息（点击复制）The site information (click to copy)：</p>
      <blockquote className='not-prose grid grid-cols-[auto_1fr] gap-x-2 break-words border-s-4 ps-4'>
        {applyTip.map(({ name, val }) => (
          <div key={name} className='contents'>
            <span className='text-end'>{name}:</span>
            <CopyableValue value={val} />
          </div>
        ))}
      </blockquote>

      <p>
        可通过 <a href='https://github.com/Yeolar/rememoi'>GitHub issue</a> 申请友链。申请说明：<br />
        Apply your link by opening an issue. Additional info:
      </p>
      <ul>
        <li>推荐了本站 You&apos;ve recommended our link on your website</li>
        <li>站点活着且有正式域名 Make sure your site is alive with a formal domain</li>
        <li>至少五篇原创文章且最近一年更新过 At least 5 original articles in the recent year</li>
        <li>内容不违反国家法律 Content does not violate laws</li>
      </ul>
    </ContentLayout>
  )
}
