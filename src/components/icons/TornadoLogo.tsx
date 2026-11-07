import { TornadoMark } from '@/components/icons/TornadoMark'
import { cn } from '@/lib/utils'

export function TornadoLogo({ className }: { className?: string }) {
  return (
    <div
      role='img'
      aria-label='Rememoi'
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-[#659EB9] to-[#2E6B85] text-[#243640] shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        className
      )}
    >
      <TornadoMark className='size-[54%]' />
    </div>
  )
}
