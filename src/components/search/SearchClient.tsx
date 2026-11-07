'use client'

import Fuse from 'fuse.js'
import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

import { Trans } from '@/components/i18n/Trans'
import { FormattedDate } from '@/components/ui/FormattedDate'
import { getLanguageLabel } from '@/lib/languages'
import { useLocale } from '@/lib/use-locale'
import type { SearchDocument } from '@/types'

export function SearchClient() {
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('all')
  const locale = useLocale()
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

  const languageOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const document of documents) {
      if (!document.language) continue
      counts.set(document.language, (counts.get(document.language) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) =>
      getLanguageLabel(a[0]).localeCompare(getLanguageLabel(b[0]))
    )
  }, [documents])

  const filteredDocuments = useMemo(
    () =>
      language === 'all'
        ? documents
        : documents.filter((document) => document.language === language),
    [documents, language]
  )

  const fuse = useMemo(
    () =>
      new Fuse(filteredDocuments, {
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
    [filteredDocuments]
  )

  const results = useMemo(() => {
    const value = deferredQuery.trim()
    if (!value) return []
    return fuse.search(value, { limit: 20 }).map((result) => result.item)
  }, [deferredQuery, fuse])

  return (
    <div className='not-prose'>
      <label className='block'>
        <span className='sr-only'><Trans en='Search posts' zh='搜索文章' /></span>
        <input
          type='search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={locale === 'zh' ? '搜索标题、标签或正文…' : 'Search titles, tags or content…'}
          className='field-input px-4 py-2.5 text-base'
          autoFocus
        />
      </label>

      {languageOptions.length > 0 && (
        <div className='mt-4 flex flex-wrap items-center gap-2 text-sm' role='group' aria-label='Filter by language'>
          <span className='text-muted-foreground'><Trans en='Language:' zh='语言：' /></span>
          <button
            type='button'
            onClick={() => setLanguage('all')}
            aria-pressed={language === 'all'}
            className={
              language === 'all'
                ? 'cursor-pointer rounded-full border bg-foreground px-3 py-1 text-background'
                : 'cursor-pointer rounded-full border bg-muted px-3 py-1 text-muted-foreground transition-colors hover:text-foreground'
            }
          >
            <Trans en={`All (${documents.length})`} zh={`全部 (${documents.length})`} />
          </button>
          {languageOptions.map(([code, count]) => (
            <button
              key={code}
              type='button'
              onClick={() => setLanguage(code)}
              aria-pressed={language === code}
              className={
                language === code
                  ? 'cursor-pointer rounded-full border bg-foreground px-3 py-1 text-background'
                  : 'cursor-pointer rounded-full border bg-muted px-3 py-1 text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              {getLanguageLabel(code)} ({count})
            </button>
          ))}
        </div>
      )}

      <div className='mt-3 min-h-6 text-sm text-muted-foreground'>
        {loading && <p><Trans en='Loading the index…' zh='正在加载索引…' /></p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && query.trim().length > 0 && (
          <p>
            <Trans
              en={`${results.length} result${results.length === 1 ? '' : 's'} for “${deferredQuery.trim()}”`}
              zh={`找到 ${results.length} 条关于“${deferredQuery.trim()}”的结果`}
            />
          </p>
        )}
        {!loading && !error && query.trim().length === 0 && (
          <p>
            <Trans
              en={`${filteredDocuments.length} post${filteredDocuments.length === 1 ? '' : 's'} indexed. Try a tag, a title or a phrase.`}
              zh={`已索引 ${filteredDocuments.length} 篇文章，试试标签、标题或短语。`}
            />
          </p>
        )}
      </div>

      {results.length > 0 && (
        <ul className='mt-6 flex flex-col gap-3'>
          {results.map((result) => (
            <li key={result.slug}>
              <Link
                href={`/memory/${result.slug}`}
                className='group block rounded-2xl border bg-background px-5 py-4 no-underline transition-colors hover:bg-muted'
              >
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                  <FormattedDate date={result.publishDate} />
                  {result.language && (
                    <span className='rounded-full border px-2 py-0.5'>
                      {getLanguageLabel(result.language)}
                    </span>
                  )}
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
        <p className='mt-6 text-muted-foreground'><Trans en='No posts match that search yet.' zh='暂时没有匹配的文章。' /></p>
      )}
    </div>
  )
}
