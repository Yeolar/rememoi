import type { MetadataRoute } from 'next'

import siteConfig from '@/config/site'
import { getAllLanguages, getAllTags, getPublishedPosts } from '@/lib/posts'
import { absoluteUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()
  const tags = getAllTags(posts)
  const languages = getAllLanguages(posts)
  const pageSize = siteConfig.content.memoryPageSize
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), priority: 1, changeFrequency: 'weekly' },
    { url: absoluteUrl('/memory'), priority: 0.9, changeFrequency: 'weekly' },
    { url: absoluteUrl('/archives'), priority: 0.6, changeFrequency: 'monthly' },
    { url: absoluteUrl('/tags'), priority: 0.5, changeFrequency: 'monthly' },
    { url: absoluteUrl('/about'), priority: 0.6, changeFrequency: 'monthly' },
    { url: absoluteUrl('/projects'), priority: 0.6, changeFrequency: 'monthly' },
    { url: absoluteUrl('/search'), priority: 0.3, changeFrequency: 'yearly' },
    { url: absoluteUrl('/terms'), priority: 0.3, changeFrequency: 'yearly' }
  ]

  const memoryRoutes: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_, index) => ({
      url: absoluteUrl(`/memory/page/${index + 2}`),
      priority: 0.5,
      changeFrequency: 'weekly' as const
    })
  )

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/memory/${post.slug}`),
    lastModified: post.updatedDate ?? post.publishDate,
    priority: 0.8,
    changeFrequency: 'monthly'
  }))

  const tagRoutes: MetadataRoute.Sitemap = tags.flatMap(([tag]) => {
    const tagPosts = posts.filter((post) => post.tags.includes(tag))
    const tagPages = Math.max(1, Math.ceil(tagPosts.length / pageSize))
    return [
      {
        url: absoluteUrl(`/tags/${encodeURIComponent(tag)}`),
        priority: 0.4,
        changeFrequency: 'monthly' as const
      },
      ...Array.from({ length: Math.max(0, tagPages - 1) }, (_, index) => ({
        url: absoluteUrl(`/tags/${encodeURIComponent(tag)}/page/${index + 2}`),
        priority: 0.3,
        changeFrequency: 'monthly' as const
      }))
    ]
  })

  const languageRoutes: MetadataRoute.Sitemap = languages.flatMap(([language, count]) => {
    const languagePages = Math.max(1, Math.ceil(count / pageSize))
    return [
      {
        url: absoluteUrl(`/memory/language/${encodeURIComponent(language)}`),
        priority: 0.4,
        changeFrequency: 'monthly' as const
      },
      ...Array.from({ length: Math.max(0, languagePages - 1) }, (_, index) => ({
        url: absoluteUrl(`/memory/language/${encodeURIComponent(language)}/page/${index + 2}`),
        priority: 0.3,
        changeFrequency: 'monthly' as const
      }))
    ]
  })

  return [...staticRoutes, ...memoryRoutes, ...postRoutes, ...tagRoutes, ...languageRoutes]
}