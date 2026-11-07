'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export type AdminSelectOption = {
  value: string
  label: string
}

type AdminSelectProps = {
  value: string
  options: AdminSelectOption[]
  onChange: (value: string) => void
  ariaLabel?: string
  className?: string
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
    >
      <path d='m6 9 6 6 6-6' />
    </svg>
  )
}

function CheckMark() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.25}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      className='size-3.5 shrink-0 text-primary'
    >
      <path d='m5 12 4 4L19 6' />
    </svg>
  )
}

export function AdminSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className
}: AdminSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
        className='flex h-[38px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-background px-3 text-left text-sm transition-colors hover:border-foreground/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10'
      >
        <span className='truncate'>{selected?.label ?? value}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div
          role='listbox'
          aria-label={ariaLabel}
          className='admin-popover absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl p-1.5'
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type='button'
                role='option'
                aria-selected={active}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                  active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <span className='truncate'>{option.label}</span>
                {active && <CheckMark />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
