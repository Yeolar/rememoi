import type { ReactNode } from 'react'

import { Icon, type IconsType } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

const asideVariants = ['note', 'tip', 'caution', 'danger'] as const
type AsideType = (typeof asideVariants)[number]

const icons: Record<AsideType, IconsType> = {
  note: 'info',
  tip: 'bulb',
  caution: 'alert',
  danger: 'octangon'
}

type AsideProps = {
  type?: AsideType
  title?: string
  className?: string
  children?: ReactNode
}

export function Aside({ type = 'note', title, className, children }: AsideProps) {
  const safeType = asideVariants.includes(type) ? type : 'note'
  const label = title ?? safeType.toUpperCase()
  return (
    <aside aria-label={label} className={cn('aside my-3 overflow-hidden rounded-xl border', className)}>
      <div className={cn('aside-container px-4 py-3', `aside-${safeType}`)}>
        <p className='aside-title not-prose flex items-center gap-x-2 font-medium' aria-hidden='true'>
          <Icon name={icons[safeType]} />
          {label}
        </p>
        <div className='aside-content mt-2'>{children}</div>
      </div>
    </aside>
  )
}
