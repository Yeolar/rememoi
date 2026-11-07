import { cn } from '@/lib/utils'

/**
 * Tornado icon from Lucide (https://lucide.dev/icons/tornado), ISC License.
 * See LICENSES/lucide.txt for the full notice.
 */
type TornadoMarkProps = {
  className?: string
  title?: string
  strokeWidth?: number
}

export function TornadoMark({ className, title, strokeWidth = 2 }: TornadoMarkProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d='M21 4H3' />
      <path d='M18 8H6' />
      <path d='M19 12H9' />
      <path d='M16 16h-6' />
      <path d='M11 20H9' />
    </svg>
  )
}
