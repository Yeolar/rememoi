/**
 * Content images are either absolute URLs/paths or paths relative to the post
 * folder. Relative paths are served from /public/memory-media/<slug>/.
 */
export function resolveMediaSrc(src: string, slug: string) {
  if (!src) return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('data:')) return src
  return `/memory-media/${slug}/${src.replace(/^\.?\//, '')}`
}
