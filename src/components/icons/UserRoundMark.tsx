import { cn } from '@/lib/utils'

/**
 * UserRound icon from Lucide (https://lucide.dev/icons/user-round), ISC License.
 * See LICENSES/lucide.txt for the full notice.
 */
export function UserRoundMark({ className }: { className?: string }) {
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
      <circle cx='12' cy='8' r='5' />
      <path d='M20 21a8 8 0 0 0-16 0' />
    </svg>
  )
}
