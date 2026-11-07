import type { Metadata, Viewport } from 'next'

import '@waline/client/style'
import 'katex/dist/katex.min.css'
import './globals.css'

import { SiteEnhancer } from '@/components/site/SiteEnhancer'
import { ThemeScript } from '@/components/site/ThemeScript'
import { Toast } from '@/components/site/Toast'
import siteConfig from '@/config/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.title} ${siteConfig.titleDelimiter} ${siteConfig.description}`,
    template: `%s ${siteConfig.titleDelimiter} ${siteConfig.title}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.title,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  keywords: ['Rememoi', 'blog', 'Next.js', 'Astro Theme Pure', 'Yeolar'],
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${siteConfig.url}/rss.xml`
    }
  },
  icons: {
    icon: [
      { url: '/icon.svg?v=tornado', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=tornado', sizes: 'any' },
      { url: '/favicon/favicon-32x32.png?v=tornado', type: 'image/png', sizes: '32x32' },
      { url: '/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' }
    ],
    shortcut: '/favicon.ico?v=tornado',
    apple: '/favicon/apple-touch-icon.png?v=tornado'
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: siteConfig.title,
    locale: siteConfig.locale.attrs,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: siteConfig.socialCard, width: 1200, height: 630, alt: siteConfig.title }]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.socialCard]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: '#FCFCFD'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.locale.lang} suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://api.fontshare.com' />
        <link rel='preconnect' href='https://cdn.fontshare.com' crossOrigin='anonymous' />
        <link
          rel='stylesheet'
          href='https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap'
        />
        <ThemeScript />
      </head>
      <body className='flex justify-center bg-background text-foreground'>
        {children}
        <Toast />
        <SiteEnhancer />
      </body>
    </html>
  )
}
