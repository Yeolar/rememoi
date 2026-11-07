import { randomUUID } from 'node:crypto'
import fs from 'node:fs'

// Load env before importing modules that read process.env at call time.
for (const file of ['.env.local', '.env']) {
  if (fs.existsSync(file)) {
    try {
      process.loadEnvFile(file)
    } catch {
      // Ignore malformed env files; Next.js will surface the real error.
    }
  }
}

async function main() {
  const { eq } = await import('drizzle-orm')
  const { ensureSchema, getDb } = await import('../src/lib/db/index')
  const { posts } = await import('../src/lib/db/schema')
  const { readSeedPosts } = await import('../src/lib/content-files')
  const { normalizeLanguage } = await import('../src/lib/languages')

  await ensureSchema()

  /** One-time in-place migration for legacy values such as `English` / `中文`. */
  async function normalizeStoredLanguages() {
    const rows = await getDb()
      .select({ id: posts.id, language: posts.language })
      .from(posts)
    let changed = 0
    for (const row of rows) {
      const normalized = normalizeLanguage(row.language)
      if (!normalized || normalized === row.language) continue
      await getDb().update(posts).set({ language: normalized }).where(eq(posts.id, row.id))
      changed += 1
    }
    if (changed > 0) console.log(`[db] normalized language on ${changed} post(s)`)
  }

  const force = process.argv.includes('--force')
  const existing = await getDb().select({ id: posts.id }).from(posts).limit(1)

  if (existing.length > 0 && !force) {
    console.log(`[db] database already contains posts — skipping seed (use --force to reseed)`)
    await normalizeStoredLanguages()
    return
  }

  if (force) {
    await getDb().delete(posts)
    console.log('[db] cleared existing posts')
  }

  const seeds = readSeedPosts()
  for (const seed of seeds) {
    const createdAt = seed.publishDate
    const updatedAt = seed.updatedDate ?? seed.publishDate
    await getDb()
      .insert(posts)
      .values({
        id: randomUUID(),
        slug: seed.slug,
        title: seed.title,
        description: seed.description,
        body: seed.body,
        format: seed.format,
        status: seed.status,
        pinned: seed.pinned,
        commentsEnabled: seed.commentsEnabled,
        language: seed.language,
        tags: seed.tags,
        heroImage: seed.heroImage,
        publishDate: seed.publishDate,
        updatedDate: seed.updatedDate,
        createdAt,
        updatedAt
      })
      .onConflictDoNothing()
  }

  console.log(`[db] seeded ${seeds.length} post(s) from content/blog`)
  await normalizeStoredLanguages()
}

main().catch((error) => {
  console.error('[db] setup failed:', error)
  process.exit(1)
})
