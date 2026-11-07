import { cn } from '@/lib/utils'

/**
 * Languages icon from Lucide (https://lucide.dev/icons/languages), ISC License.
 * See LICENSES/lucide.txt for the full notice.
 */
export function LanguagesMark({ className }: { className?: string }) {
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
      <path d='m5 8 6 6' />
      <path d='m4 14 6-6 2-3' />
      <path d='M2 5h12' />
      <path d='M7 2h1' />
      <path d='m22 22-5-10-5 10' />
      <path d='M14 18h6' />
    </svg>
  )
}
