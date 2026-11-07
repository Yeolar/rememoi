import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { Post } from '@/types'

type ArticleBottomProps = {
  prev?: Post
  next?: Post
  className?: string
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn(
        'shrink-0 stroke-muted-foreground transition-colors group-hover:stroke-primary',
        direction === 'left' && 'rotate-180'
      )}
    >
      <line
        x1='5'
        y1='12'
        x2='19'
        y2='12'
        className='translate-x-4 scale-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-x-100'
      />
      <polyline
        points='12 5 19 12 12 19'
        className='translate-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1'
      />
    </svg>
  )
}

export function ArticleBottom({ prev, next, className }: ArticleBottomProps) {
  return (
    <div className={cn('flex gap-2 max-sm:flex-col sm:justify-between', className)}>
      <span className='min-w-0'>
        {prev && (
          <Link
            href={`/memory/${prev.slug}`}
            className='group inline-flex items-center gap-x-2 rounded-xl px-4 py-2 no-underline transition-colors duration-300 hover:bg-muted max-sm:max-w-[80%] sm:flex'
          >
            <Arrow direction='left' />
            <p className='truncate font-medium transition-colors'>{prev.title}</p>
          </Link>
        )}
      </span>

      <span className='min-w-0'>
        {next && (
          <Link
            href={`/memory/${next.slug}`}
            className='group inline-flex items-center gap-x-2 rounded-xl px-4 py-2 text-right no-underline transition-colors duration-300 hover:bg-muted max-sm:float-end max-sm:max-w-[80%] sm:flex'
          >
            <p className='truncate font-medium transition-colors'>{next.title}</p>
            <Arrow direction='right' />
          </Link>
        )}
      </span>
    </div>
  )
}
