
import fs from 'node:fs'
import path from 'node:path'

import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'

import * as schema from './schema'

/**
 * One driver for both local development and production:
 * - local:      DATABASE_URL=file:./data/rememoi.db
 * - production: DATABASE_URL=libsql://<db>-<org>.turso.io + DATABASE_AUTH_TOKEN
 */

let client: Client | null = null
let database: LibSQLDatabase<typeof schema> | null = null
let schemaReady: Promise<void> | null = null

function ensureLocalDirectory(url: string) {
  if (!url.startsWith('file:')) return
  const filePath = url.slice('file:'.length)
  if (/^[a-z]+:\/\//i.test(filePath)) return
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), filePath)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
}

export function getClient() {
  if (!client) {
    const url = process.env.DATABASE_URL || 'file:./data/rememoi.db'
    ensureLocalDirectory(url)
    client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined
    })
  }
  return client
}

export function getDb() {
  if (!database) {
    database = drizzle(getClient(), { schema })
  }
  return database
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    body TEXT NOT NULL,
    format TEXT NOT NULL,
    status TEXT NOT NULL,
    pinned INTEGER NOT NULL DEFAULT 0,
    comments_enabled INTEGER NOT NULL DEFAULT 1,
    language TEXT,
    tags TEXT NOT NULL,
    hero_image TEXT,
    publish_date INTEGER NOT NULL,
    updated_date INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  'CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts(slug)',
  'CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status)',
  'CREATE INDEX IF NOT EXISTS posts_publish_date_idx ON posts(publish_date)',
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    data BLOB NOT NULL,
    created_at INTEGER NOT NULL
  )`
]

const TABLES_EXIST_SQL = `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('posts', 'images')`

async function schemaExists() {
  try {
    const result = await getClient().execute(TABLES_EXIST_SQL)
    return result.rows.length >= 2
  } catch {
    return false
  }
}

function isLockedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /busy|locked|SQLITE_BUSY/i.test(message)
}

async function createSchema() {
  const client = getClient()

  // Fast path: `pnpm db:setup` has already created the tables. This avoids
  // concurrent DDL writes when Next.js spawns several build workers.
  if (await schemaExists()) return

  try {
    await client.execute('PRAGMA busy_timeout = 5000')
  } catch {
    // Remote libSQL may not expose PRAGMA execution; retries below still help.
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      await client.batch(DDL, 'write')
      return
    } catch (error) {
      if (attempt === 4 || !isLockedError(error)) throw error
      await new Promise((resolve) => setTimeout(resolve, attempt * 150))
    }
  }
}

/**
 * Creates tables when they do not exist yet. Kept idempotent so the project can
 * be bootstrapped with `pnpm db:setup` and also works on a fresh remote libSQL
 * database.
 */
export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = createSchema().catch((error) => {
      schemaReady = null
      throw error
    })
  }
  return schemaReady
}
