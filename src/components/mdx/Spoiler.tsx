import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SpoilerProps = {
  className?: string
  children?: ReactNode
}

export function Spoiler({ className, children }: SpoilerProps) {
  return (
    <span className={cn('spoiler rounded bg-muted px-1 transition-colors', className)}>
      {children}
    </span>
  )
}
