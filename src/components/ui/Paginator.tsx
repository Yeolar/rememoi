import Link from 'next/link'
import type { ReactNode } from 'react'

import { Trans } from '@/components/i18n/Trans'

type PaginationLink = {
  url: string
  text?: ReactNode
  srLabel?: string
}

type PaginatorProps = {
  nextUrl?: PaginationLink
  prevUrl?: PaginationLink
}

export function Paginator({ nextUrl, prevUrl }: PaginatorProps) {
  if (!prevUrl && !nextUrl) return null
  return (
    <nav className='mt-4 flex items-center gap-x-4 sm:mt-6' aria-label='Pagination'>
      {prevUrl && (
        <Link className='me-auto py-2' href={prevUrl.url}>
          {prevUrl.srLabel && <span className='sr-only'>{prevUrl.srLabel}</span>}
          {prevUrl.text ?? <Trans en='Previous' zh='上一页' />}
        </Link>
      )}
      {nextUrl && (
        <Link className='ms-auto py-2' href={nextUrl.url}>
          {nextUrl.srLabel && <span className='sr-only'>{nextUrl.srLabel}</span>}
          {nextUrl.text ?? <Trans en='Next' zh='下一页' />}
        </Link>
      )}
    </nav>
  )
}
