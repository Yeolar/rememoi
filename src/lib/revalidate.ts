import { revalidatePath } from 'next/cache'

/** Invalidate every public page after a post changes. */
export function revalidatePublicSite() {
  revalidatePath('/', 'layout')
  revalidatePath('/rss.xml')
  revalidatePath('/search-index.json')
  revalidatePath('/sitemap.xml')
}
