import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'

import { normalizeLanguage } from '@/lib/languages'
import { resolveMediaSrc } from '@/lib/media'
import type { PostFrontmatter, PostImage } from '@/types'

/**
 * Markdown files under content/blog are the seed source for the database.
 * Once a post has been imported, the admin editor is the source of truth.
 */

export const CONTENT_ROOT = path.join(process.cwd(), 'content', 'blog')
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx'])

export type SeedPost = {
  slug: string
  title: string
  description: string
  body: string
  format: 'md' | 'mdx'
  status: 'draft' | 'published'
  pinned: boolean
  commentsEnabled: boolean
  language: string | null
  tags: string[]
  heroImage: PostImage | null
  publishDate: Date
  updatedDate: Date | null
}

function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath))
    } else if (MARKDOWN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }
  return files
}

function toSlug(relativePath: string) {
  const parts = relativePath.split(path.sep)
  const fileName = parts.pop()!
  const baseName = fileName.replace(/\.(md|mdx)$/, '')
  if (baseName !== 'index') parts.push(baseName)
  return parts.join('/')
}

function normalizeDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (value instanceof Date) {
    // js-yaml turns `2025-02-09` into UTC midnight. Rebuild it as local noon so
    // date-only values never shift by a day in negative UTC offsets.
    const iso = value.toISOString()
    if (/T00:00:00\.000Z$/.test(iso)) {
      const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
      return new Date(y, m - 1, d, 12)
    }
    return value
  }
  const raw = String(value).trim()
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/)
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12)
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags) || tags.length === 0) return []
  return Array.from(new Set(tags.map((tag) => String(tag).toLowerCase())))
}

function readSeedPost(filePath: string): SeedPost {
  const source = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(source)
  const relativePath = path.relative(CONTENT_ROOT, filePath)
  const slug = toSlug(relativePath)
  const frontmatter = data as Partial<PostFrontmatter>

  const publishDate = normalizeDate(frontmatter.publishDate)
  if (!publishDate) {
    throw new Error(`[seed] Missing or invalid publishDate in "${relativePath}"`)
  }

  const heroImage = frontmatter.heroImage?.src
    ? {
        src: resolveMediaSrc(frontmatter.heroImage.src, slug),
        alt: frontmatter.heroImage.alt,
        width: frontmatter.heroImage.width,
        height: frontmatter.heroImage.height,
        color: frontmatter.heroImage.color
      }
    : null

  return {
    slug,
    title: frontmatter.title || slug,
    description: frontmatter.description || '',
    body: content,
    format: path.extname(filePath) === '.mdx' ? 'mdx' : 'md',
    status: frontmatter.draft ? 'draft' : 'published',
    pinned: Boolean(frontmatter.pin),
    commentsEnabled: frontmatter.comment !== false,
    language: normalizeLanguage(frontmatter.language) ?? null,
    tags: normalizeTags(frontmatter.tags),
    heroImage,
    publishDate,
    updatedDate: normalizeDate(frontmatter.updatedDate) ?? null
  }
}

export function readSeedPosts() {
  return walkMarkdownFiles(CONTENT_ROOT)
    .map(readSeedPost)
    .sort((a, b) => a.publishDate.valueOf() - b.publishDate.valueOf())
}
