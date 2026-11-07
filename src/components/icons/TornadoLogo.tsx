import { TornadoMark } from '@/components/icons/TornadoMark'
import { cn } from '@/lib/utils'

export function TornadoLogo({ className }: { className?: string }) {
  return (
    <div
      role='img'
      aria-label='Rememoi'
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-[#B3E8FA] to-[#6FA8BD] text-[#243640] shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        className
      )}
    >
      <TornadoMark className='size-[54%]' strokeWidth={3} />
    </div>
  )
}
