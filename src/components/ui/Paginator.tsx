import Link from 'next/link'

type PaginationLink = {
  url: string
  text?: string
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
          {prevUrl.text ?? 'Previous'}
        </Link>
      )}
      {nextUrl && (
        <Link className='ms-auto py-2' href={nextUrl.url}>
          {nextUrl.srLabel && <span className='sr-only'>{nextUrl.srLabel}</span>}
          {nextUrl.text ?? 'Next'}
        </Link>
      )}
    </nav>
  )
}
