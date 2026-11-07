import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type LabelProps = {
  title: string
  href?: string
  className?: string
  icon?: ReactNode
  children?: ReactNode
  target?: string
}

export function Label({ title, href, className, icon, children, target }: LabelProps) {
  const Tag = href ? 'a' : 'div'
  return (
    <Tag
      className={cn(
        'flex flex-row items-center justify-center gap-x-2',
        href && 'transition-all hover:opacity-75 no-underline',
        className
      )}
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {icon}
      {children ?? <p>{title}</p>}
    </Tag>
  )
}
