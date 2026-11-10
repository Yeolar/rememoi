import { cn } from '@/lib/utils'

/**
 * Lock icon from Lucide (https://lucide.dev/icons/lock), ISC License.
 * See LICENSES/lucide.txt for the full notice.
 */
export function LockMark({ className }: { className?: string }) {
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
      <rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
      <path d='M7 11V7a5 5 0 0 1 10 0v4' />
    </svg>
  )
}
