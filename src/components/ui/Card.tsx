import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CardProps = {
  as?: 'div' | 'a'
  href?: string
  heading?: string
  subheading?: string
  date?: string
  className?: string
  children?: ReactNode
  target?: string
}

export function Card({
  as,
  href,
  heading,
  subheading,
  date,
  className,
  children,
  target
}: CardProps) {
  const Tag = as ?? (href ? 'a' : 'div')
  return (
    <Tag
      className={cn(
        'not-prose block relative rounded-2xl border bg-muted px-5 py-3',
        'no-underline text-foreground',
        href && 'transition-all hover:border-foreground/25 hover:shadow-sm',
        className
      )}
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      <div className='flex flex-col gap-y-1.5'>
        <div className='flex flex-col gap-y-0.5'>
          {heading && <h2 className='text-lg font-medium not-prose'>{heading}</h2>}
          {subheading && <p className='text-muted-foreground'>{subheading}</p>}
          {date && <p className='text-muted-foreground'>{date}</p>}
        </div>
        {children}
      </div>
    </Tag>
  )
}
