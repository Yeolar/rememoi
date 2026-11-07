import { randomUUID } from 'node:crypto'

import { and, desc, eq, ne } from 'drizzle-orm'

import { ensureSchema, getDb } from '@/lib/db'
import { posts, type PostRow } from '@/lib/db/schema'
import type { PostInput, PostUpdateInput } from '@/lib/validation'
import type { AdminPostDTO, PostImage } from '@/types'

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)))
}

function normalizeHeroImage(image: PostImage | null | undefined): PostImage | null {
  if (!image?.src) return null
  return {
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
    color: image.color
  }
}

export function toAdminPost(row: PostRow): AdminPostDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    format: row.format,
    status: row.status,
    pinned: row.pinned,
    commentsEnabled: row.commentsEnabled,
    language: row.language ?? null,
    tags: row.tags ?? [],
    heroImage: row.heroImage ?? null,
    publishDate: row.publishDate.toISOString(),
    updatedDate: row.updatedDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }
}

export async function listAdminPosts() {
  await ensureSchema()
  const rows = await getDb()
    .select()
    .from(posts)
    .orderBy(desc(posts.updatedAt), desc(posts.publishDate))
  return rows.map((row) => {
    const post = toAdminPost(row)
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      format: post.format,
      status: post.status,
      pinned: post.pinned,
      commentsEnabled: post.commentsEnabled,
      language: post.language,
      tags: post.tags,
      heroImage: post.heroImage,
      publishDate: post.publishDate,
      updatedDate: post.updatedDate,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }
  })
}

export async function getAdminPost(id: string): Promise<AdminPostDTO | null> {
  await ensureSchema()
  const [row] = await getDb().select().from(posts).where(eq(posts.id, id)).limit(1)
  return row ? toAdminPost(row) : null
}

async function findSlugConflict(slug: string, excludeId?: string) {
  await ensureSchema()
  const condition = excludeId ? and(eq(posts.slug, slug), ne(posts.id, excludeId)) : eq(posts.slug, slug)
  const [row] = await getDb().select({ id: posts.id }).from(posts).where(condition).limit(1)
  return row
}

export async function uniqueSlug(base: string, excludeId?: string) {
  let candidate = base
  let suffix = 2
  while (await findSlugConflict(candidate, excludeId)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

export async function createAdminPost(input: PostInput): Promise<AdminPostDTO> {
  await ensureSchema()
  const now = new Date()
  const slug = await uniqueSlug(input.slug)
  const [row] = await getDb()
    .insert(posts)
    .values({
      id: randomUUID(),
      slug,
      title: input.title,
      description: input.description ?? '',
      body: input.body,
      format: input.format,
      status: input.status,
      pinned: input.pinned,
      commentsEnabled: input.commentsEnabled,
      language: input.language || null,
      tags: normalizeTags(input.tags),
      heroImage: normalizeHeroImage(input.heroImage),
      publishDate: input.publishDate,
      updatedDate: input.updatedDate ?? null,
      createdAt: now,
      updatedAt: now
    })
    .returning()
  return toAdminPost(row)
}

export async function updateAdminPost(
  id: string,
  input: PostUpdateInput
): Promise<AdminPostDTO | null> {
  await ensureSchema()
  const [existing] = await getDb().select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!existing) return null

  const values: Partial<typeof posts.$inferInsert> = { updatedAt: new Date() }
  if (input.title !== undefined) values.title = input.title
  if (input.description !== undefined) values.description = input.description
  if (input.body !== undefined) values.body = input.body
  if (input.format !== undefined) values.format = input.format
  if (input.status !== undefined) values.status = input.status
  if (input.pinned !== undefined) values.pinned = input.pinned
  if (input.commentsEnabled !== undefined) values.commentsEnabled = input.commentsEnabled
  if (input.language !== undefined) values.language = input.language || null
  if (input.tags !== undefined) values.tags = normalizeTags(input.tags)
  if (input.heroImage !== undefined) values.heroImage = normalizeHeroImage(input.heroImage)
  if (input.publishDate !== undefined) values.publishDate = input.publishDate
  if (input.updatedDate !== undefined) values.updatedDate = input.updatedDate ?? null
  if (input.slug !== undefined && input.slug !== existing.slug) {
    values.slug = await uniqueSlug(input.slug, id)
  }

  const [row] = await getDb().update(posts).set(values).where(eq(posts.id, id)).returning()
  return row ? toAdminPost(row) : null
}

export async function deleteAdminPost(id: string) {
  await ensureSchema()
  const result = await getDb().delete(posts).where(eq(posts.id, id)).returning({ id: posts.id })
  return result.length > 0
}
