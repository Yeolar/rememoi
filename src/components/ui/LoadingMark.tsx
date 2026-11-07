import { TornadoMark } from '@/components/icons/TornadoMark'

export function LoadingMark({ label = '正在加载…' }: { label?: string }) {
  return (
    <div role='status' aria-live='polite' className='flex flex-col items-center gap-3 py-16'>
      <TornadoMark className='size-9 text-primary motion-safe:animate-spin motion-safe:[animation-duration:2.4s] motion-reduce:animate-none' />
      <span className='text-sm text-muted-foreground'>{label}</span>
    </div>
  )
}
