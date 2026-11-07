import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SectionProps = {
  title: string
  className?: string
  children?: ReactNode
}

export function Section({ title, className, children }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-y-5 md:flex-row md:gap-y-0', className)}>
      <div className='text-xl font-medium md:min-w-36'>
        <h2>{title}</h2>
      </div>
      <div className='flex flex-1 flex-col gap-y-3'>{children}</div>
    </section>
  )
}
