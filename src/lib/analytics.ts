/**
 * Google Analytics 4 bridge.
 *
 * `NEXT_PUBLIC_GA_ID` is inlined at build time. When it is empty every helper
 * below is a no-op, so the site makes no request to Google at all.
 *
 * Commands are queued through the same `dataLayer` shim as Google's own
 * snippet. That way a page view can be reported before `gtag.js` has finished
 * loading, and the initial view is not lost to a race with the script tag.
 */
export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_ID ?? '').trim()

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>

/** Admin tools, API routes and private previews must never reach analytics. */
const EXCLUDED_PATHS = ['/admin', '/preview', '/api']

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __rememoiGa?: boolean
  }
}

export function isAnalyticsPath(pathname: string) {
  return !EXCLUDED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function isTrackingAllowed() {
  return typeof window !== 'undefined' && isAnalyticsPath(window.location.pathname)
}

/**
 * Google's snippet queues the `arguments` object, not a plain array; gtag.js
 * ignores arrays, which would queue commands that are never sent.
 */
function queueCommand() {
  window.dataLayer?.push(arguments)
}

function getGtag() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return null

  window.dataLayer = window.dataLayer ?? []
  if (!window.__rememoiGa) {
    window.__rememoiGa = true
    window.gtag = window.gtag ?? (queueCommand as (...args: unknown[]) => void)
    window.gtag('js', new Date())
    // Page views are sent explicitly below, once per route, including the first.
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  }

  return window.gtag ?? null
}

export function trackPageView(pagePath: string, pageTitle?: string) {
  if (!isTrackingAllowed()) return
  const gtag = getGtag()
  if (!gtag) return

  gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: pageTitle ?? document.title
  })
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}) {
  if (!isTrackingAllowed()) return
  const gtag = getGtag()
  if (!gtag) return

  gtag('event', name, params)
}
