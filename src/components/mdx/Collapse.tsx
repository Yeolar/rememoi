'use client'

import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CollapseProps = {
  title: string
  className?: string
  children?: ReactNode
  defaultOpen?: boolean
}

export function Collapse({ title, className, children, defaultOpen = false }: CollapseProps) {
  const [expanded, setExpanded] = useState(defaultOpen)
  return (
    <div className='group/expand'>
      <div
        className={cn(
          'my-4 rounded-xl border px-3 sm:px-4',
          expanded && 'bg-muted',
          className
        )}
      >
        <button
          type='button'
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className='group/highlight sticky top-0 z-20 flex w-full cursor-pointer items-center justify-between py-1.5 text-left sm:py-2'
        >
          <p className='m-0 transition-colors group-hover/highlight:text-primary'>{title}</p>
          <span className='expand-button'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={cn(
                'my-1 stroke-muted-foreground transition-all duration-300 group-hover/highlight:stroke-primary',
                expanded && '-rotate-90'
              )}
            >
              <line
                x1='5'
                y1='12'
                x2='19'
                y2='12'
                className={cn(
                  'translate-x-1 scale-x-100 duration-300 ease-in-out',
                  expanded && 'translate-x-4 scale-x-0'
                )}
              />
              <polyline
                points='12 5 19 12 12 19'
                className={cn('translate-x-1 duration-300 ease-in-out', expanded && 'translate-x-0')}
              />
            </svg>
          </span>
        </button>
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            expanded ? 'mb-3 grid-rows-[1fr] opacity-100 sm:mb-4' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className='overflow-hidden'>{children}</div>
        </div>
      </div>
    </div>
  )
}
