import { blob, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import type { PostImage } from '@/types'

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    body: text('body').notNull(),
    format: text('format', { enum: ['md', 'mdx'] }).notNull(),
    status: text('status', { enum: ['draft', 'published', 'private'] }).notNull(),
    pinned: integer('pinned', { mode: 'boolean' }).notNull(),
    commentsEnabled: integer('comments_enabled', { mode: 'boolean' }).notNull(),
    language: text('language'),
    tags: text('tags', { mode: 'json' }).$type<string[]>().notNull(),
    heroImage: text('hero_image', { mode: 'json' }).$type<PostImage | null>(),
    publishDate: integer('publish_date', { mode: 'timestamp_ms' }).notNull(),
    updatedDate: integer('updated_date', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
  },
  (table) => [
    uniqueIndex('posts_slug_unique').on(table.slug),
    index('posts_status_idx').on(table.status),
    index('posts_publish_date_idx').on(table.publishDate)
  ]
)

export const images = sqliteTable('images', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  data: blob('data').notNull(),
  storage: text('storage', { enum: ['db', 'cos'] }).notNull().default('db'),
  storageKey: text('storage_key'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})

export type PostRow = typeof posts.$inferSelect
export type NewPostRow = typeof posts.$inferInsert
export type ImageRow = typeof images.$inferSelect
