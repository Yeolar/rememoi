import type { Metadata } from 'next'

import siteConfig from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

type MetaInput = {
  title: string
  description?: string
  path: string
  ogImage?: string
  /** Open Graph locale, e.g. zh_CN / en_US. */
  ogLocale?: string
  /** Emitted as a content-language meta tag. */
  contentLanguage?: string
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
  ogLocale,
  contentLanguage,
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
      locale: ogLocale ?? siteConfig.locale.attrs,
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
    },
    ...(contentLanguage && {
      other: {
        'content-language': contentLanguage
      }
    })
  }
}
