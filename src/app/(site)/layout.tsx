import { auth, isAuthConfigured } from '@/auth'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'

/**
 * Post content lives in SQLite and changes at runtime, so these pages must not be
 * frozen at build time. Without this, `/`, `/memory` and `/archives` are
 * prerendered from whatever the database held during `next build` and keep serving
 * that snapshot: a post published afterwards is reachable at `/memory/<slug>` (a
 * dynamic route, rendered on demand) but never appears in any listing until
 * something calls `revalidatePublicSite()` — and that invalidation is lost
 * whenever the container is recreated, which restores the build-time snapshot.
 * The feed endpoints (rss.xml, sitemap.ts, search-index.json) already opt into
 * force-dynamic for the same reason; this makes the HTML pages match them.
 */
export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = isAuthConfigured ? await auth() : null
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        login: session.user.login ?? null,
        image: session.user.image ?? null
      }
    : null

  return (
    <div
      id='main-container'
      className='flex min-h-[100dvh] w-full max-w-[70rem] flex-col justify-between'
    >
      <Header user={user} />
      <div className='w-full flex-1'>{children}</div>
      <Footer />
    </div>
  )
}
