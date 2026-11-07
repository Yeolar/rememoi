import { and, desc, eq } from 'drizzle-orm'

import siteConfig from '@/config/site'
import { ensureSchema, getDb } from '@/lib/db'
import { posts, type PostRow } from '@/lib/db/schema'
import { derivePostContent } from '@/lib/markdown-utils'
import type { Post, PostSummary } from '@/types'

const isDevelopment = process.env.NODE_ENV !== 'production'

function rowToPost(row: PostRow): Post {
  const derived = derivePostContent(row.body)
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishDate: row.publishDate,
    updatedDate: row.updatedDate ?? undefined,
    publishDateISO: row.publishDate.toISOString(),
    updatedDateISO: row.updatedDate?.toISOString(),
    heroImage: row.heroImage ?? undefined,
    tags: row.tags ?? [],
    language: row.language ?? undefined,
    draft: row.status !== 'published',
    status: row.status,
    pin: row.pinned,
    comment: row.commentsEnabled,
    minutesRead: derived.minutesRead,
    words: derived.words,
    headings: derived.headings,
    body: row.body,
    plainText: derived.plainText,
    format: row.format,
    sourcePath: ''
  }
}

export function toPostSummary(post: Post): PostSummary {
  const { body: _body, headings: _headings, plainText: _plainText, sourcePath: _source, format: _format, ...rest } = post
  return rest
}

/** Public posts. Drafts are visible while developing, like the Astro theme. */
export async function getVisiblePosts(): Promise<Post[]> {
  await ensureSchema()
  const rows = await getDb()
    .select()
    .from(posts)
    .where(isDevelopment ? undefined : eq(posts.status, 'published'))
    .orderBy(desc(posts.pinned), desc(posts.publishDate))
  return rows.map(rowToPost)
}

/** Only published posts — used by the public API and RSS. */
export async function getPublishedPosts(): Promise<Post[]> {
  await ensureSchema()
  const rows = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.pinned), desc(posts.publishDate))
  return rows.map(rowToPost)
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  await ensureSchema()
  const [row] = await getDb().select().from(posts).where(eq(posts.slug, slug)).limit(1)
  return row ? rowToPost(row) : undefined
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | undefined> {
  await ensureSchema()
  const [row] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1)
  return row ? rowToPost(row) : undefined
}

export async function getPostById(id: string) {
  await ensureSchema()
  const [row] = await getDb().select().from(posts).where(eq(posts.id, id)).limit(1)
  return row
}

export function sortPosts(postsToSort: Post[]) {
  return [...postsToSort].sort((a, b) => {
    if (a.pin !== b.pin) return Number(b.pin) - Number(a.pin)
    return b.publishDate.valueOf() - a.publishDate.valueOf()
  })
}

export function getAllTags(postList: Post[]) {
  const counts = new Map<string, number>()
  for (const post of postList) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export async function getPostsByTag(tag: string) {
  const postsList = await getVisiblePosts()
  return postsList.filter((post) => post.tags.includes(tag.toLowerCase()))
}

export function groupPostsByYear(postList: Post[]) {
  const groups = new Map<number, Post[]>()
  for (const post of postList) {
    const year = (post.updatedDate ?? post.publishDate).getFullYear()
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(post)
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0])
}

export async function getAdjacentPosts(slug: string) {
  const postsList = await getVisiblePosts()
  const index = postsList.findIndex((post) => post.slug === slug)
  return {
    prev: index > 0 ? postsList[index - 1] : undefined,
    next: index >= 0 && index < postsList.length - 1 ? postsList[index + 1] : undefined
  }
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize = siteConfig.content.blogPageSize
) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
    pageSize
  }
}

export function isDraftVisible() {
  return isDevelopment
}
