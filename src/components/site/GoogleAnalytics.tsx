'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { Suspense, useEffect, useRef } from 'react'

import { GA_MEASUREMENT_ID, isAnalyticsPath, trackPageView } from '@/lib/analytics'

/**
 * Reports an explicit page_view for every route change.
 *
 * `gtag('config', …, { send_page_view: false })` stops gtag from sending its
 * own view, so this is the only source of page views: one on first load and one
 * per App Router navigation. `previousPath` drops the duplicate the effect
 * would otherwise send on mount (and in React strict mode).
 */
function PageViewReporter() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const previousPath = useRef<string | null>(null)

  useEffect(() => {
    const pagePath = search ? `${pathname}?${search}` : pathname
    const previous = previousPath.current
    previousPath.current = pagePath
    if (previous === pagePath || !isAnalyticsPath(pagePath)) return
    trackPageView(pagePath)
  }, [pathname, search])

  return null
}

/**
 * Loads gtag.js when `NEXT_PUBLIC_GA_ID` is configured. Rendering nothing when
 * the ID is absent keeps development and self-hosted builds free of requests
 * to Google.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        id='google-analytics'
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='afterInteractive'
      />
      <Suspense fallback={null}>
        <PageViewReporter />
      </Suspense>
    </>
  )
}
