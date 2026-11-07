import { cn } from '@/lib/utils'

/**
 * CirclePlus icon from Lucide (https://lucide.dev/icons/circle-plus), ISC License.
 * See LICENSES/lucide.txt for the full notice.
 */
export function CirclePlusMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M8 12h8' />
      <path d='M12 8v8' />
    </svg>
  )
}
