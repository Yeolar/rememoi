import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StepsProps = {
  className?: string
  children?: ReactNode
}

/** Wraps a markdown ordered list and renders it as numbered steps. */
export function Steps({ className, children }: StepsProps) {
  return <div className={cn('my-4', 'sl-steps', className)}>{children}</div>
}
