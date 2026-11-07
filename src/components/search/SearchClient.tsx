'use client'

import Fuse from 'fuse.js'
import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

import { FormattedDate } from '@/components/ui/FormattedDate'
import type { SearchDocument } from '@/types'

export function SearchClient() {
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    let cancelled = false
    fetch('/search-index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load the search index')
        return response.json()
      })
      .then((data: SearchDocument[]) => {
        if (!cancelled) {
          setDocuments(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('The search index is unavailable right now.')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'description', weight: 0.2 },
          { name: 'tags', weight: 0.15 },
          { name: 'headings', weight: 0.1 },
          { name: 'content', weight: 0.05 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2
      }),
    [documents]
  )

  const results = useMemo(() => {
    const value = deferredQuery.trim()
    if (!value) return []
    return fuse.search(value, { limit: 20 }).map((result) => result.item)
  }, [deferredQuery, fuse])

  return (
    <div className='not-prose'>
      <label className='block'>
        <span className='sr-only'>Search posts</span>
        <input
          type='search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Search titles, tags or content…'
          className='field-input px-4 py-2.5 text-base'
          autoFocus
        />
      </label>

      <div className='mt-3 min-h-6 text-sm text-muted-foreground'>
        {loading && <p>Loading the index…</p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && query.trim().length > 0 && (
          <p>
            {results.length} result{results.length === 1 ? '' : 's'} for “{deferredQuery.trim()}”
          </p>
        )}
        {!loading && !error && query.trim().length === 0 && (
          <p>{documents.length} posts indexed. Try a tag, a title or a phrase.</p>
        )}
      </div>

      {results.length > 0 && (
        <ul className='mt-6 flex flex-col gap-3'>
          {results.map((result) => (
            <li key={result.slug}>
              <Link
                href={`/blog/${result.slug}`}
                className='group block rounded-2xl border bg-background px-5 py-4 no-underline transition-colors hover:bg-muted'
              >
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                  <FormattedDate date={result.publishDate} />
                  {result.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className='rounded-full border px-2 py-0.5'>
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className='mt-1 text-lg font-medium text-foreground group-hover:text-primary'>
                  {result.title}
                </h2>
                <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                  {result.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && query.trim().length > 0 && results.length === 0 && (
        <p className='mt-6 text-muted-foreground'>No posts match that search yet.</p>
      )}
    </div>
  )
}
