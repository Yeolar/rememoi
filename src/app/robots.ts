import type { MetadataRoute } from 'next'

import siteConfig from '@/config/site'
import { absoluteUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/api/auth']
      }
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url
  }
}
