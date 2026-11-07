import siteConfig from '@/config/site'
import { renderMarkdownToHtml } from '@/lib/markdown'
import { getPublishedPosts } from '@/lib/posts'
import { absoluteUrl, escapeXml } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await getPublishedPosts()
  const lastBuildDate = posts
    .map((post) => (post.updatedDate ?? post.publishDate).getTime())
    .sort((a, b) => b - a)[0]

  const items = await Promise.all(
    posts.map(async (post) => {
      const url = absoluteUrl(`/memory/${post.slug}`)
      const html = await renderMarkdownToHtml(post.body, post.slug)
      const image = post.heroImage?.src ? absoluteUrl(post.heroImage.src) : absoluteUrl(siteConfig.socialCard)
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  <pubDate>${post.publishDate.toUTCString()}</pubDate>
  <description>${escapeXml(post.description)}</description>
  <content:encoded><![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
  <enclosure url="${escapeXml(image)}" type="image/jpeg" />
  ${post.updatedDateISO ? `<atom:updated>${post.updatedDateISO}</atom:updated>` : ''}
  ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}
</item>`
    })
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${escapeXml(siteConfig.locale.lang)}</language>
    <atom:link href="${escapeXml(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />
    ${lastBuildDate ? `<lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>` : ''}
    <generator>Next.js</generator>
    ${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    }
  })
}
