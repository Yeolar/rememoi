import type { Metadata } from 'next'

import siteConfig from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

type MetaInput = {
  title: string
  description?: string
  path: string
  ogImage?: string
  article?: {
    publishedTime: string
    modifiedTime?: string
    authors?: string[]
    tags?: string[]
  }
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  ogImage = siteConfig.socialCard,
  article
}: MetaInput): Metadata {
  const url = absoluteUrl(path)
  const image = ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage)

  return {
    title,
    description,
    alternates: {
      canonical: url,
      types: {
        'application/rss+xml': absoluteUrl('/rss.xml')
      }
    },
    openGraph: {
      type: article ? 'article' : 'website',
      url,
      title,
      description,
      siteName: siteConfig.title,
      locale: siteConfig.locale.attrs,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            tags: article.tags
          }
        : {})
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  }
}
