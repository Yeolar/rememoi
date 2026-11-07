'use client'

import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import { useLocale } from '@/lib/use-locale'
import { cn } from '@/lib/utils'

type AdminDatePickerProps = {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  className?: string
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day, 12)
}

function toDateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      className='size-4'
    >
      {direction === 'left' ? <path d='m15 18-6-6 6-6' /> : <path d='m9 18 6-6-6-6' />}
    </svg>
  )
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

export function AdminDatePicker({ value, onChange, ariaLabel, className }: AdminDatePickerProps) {
  const locale = useLocale()
  const language = locale === 'zh' ? 'zh-CN' : 'en-US'
  const selected = parseDate(value)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => startOfMonth(selected))
  const rootRef = useRef<HTMLDivElement>(null)

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

  const toggle = () => {
    if (!open) setViewDate(startOfMonth(selected))
    setOpen((value) => !value)
  }

  const moveMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1, 12))
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1, 12).getDay()
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const weekdays =
    locale === 'zh'
      ? ['日', '一', '二', '三', '四', '五', '六']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const monthLabel = new Intl.DateTimeFormat(language, {
    month: 'long',
    year: 'numeric'
  }).format(viewDate)
  const displayDate = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(selected)

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
        className='flex h-[38px] w-full cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm transition-colors hover:border-foreground/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10'
      >
        <Icon name='calendar' className='size-4 shrink-0 text-muted-foreground' />
        <span className='truncate'>{displayDate}</span>
        <span className='ml-auto'>
          <ChevronDown open={open} />
        </span>
      </button>

      {open && (
        <div
          role='dialog'
          aria-label={ariaLabel}
          className='admin-popover absolute left-0 top-full z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl p-3'
        >
          <div className='flex items-center justify-between gap-2'>
            <button
              type='button'
              onClick={() => moveMonth(-1)}
              aria-label={locale === 'zh' ? '上个月' : 'Previous month'}
              className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <Chevron direction='left' />
            </button>
            <p className='text-sm font-medium'>{monthLabel}</p>
            <button
              type='button'
              onClick={() => moveMonth(1)}
              aria-label={locale === 'zh' ? '下个月' : 'Next month'}
              className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <Chevron direction='right' />
            </button>
          </div>

          <div className='mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground'>
            {weekdays.map((weekday) => (
              <span key={weekday} className='py-1'>
                {weekday}
              </span>
            ))}
          </div>

          <div className='mt-1 grid grid-cols-7 gap-1'>
            {cells.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} />
              const date = new Date(year, month, day, 12)
              const active = sameDay(date, selected)
              const current = sameDay(date, today)
              return (
                <button
                  key={day}
                  type='button'
                  aria-label={new Intl.DateTimeFormat(language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).format(date)}
                  aria-current={current ? 'date' : undefined}
                  onClick={() => {
                    onChange(toDateValue(date))
                    setOpen(false)
                  }}
                  className={cn(
                    'flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : 'text-foreground hover:bg-muted',
                    !active && current && 'border border-primary/40 text-primary'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className='mt-2 flex justify-end border-t pt-2'>
            <button
              type='button'
              onClick={() => {
                onChange(toDateValue(today))
                setOpen(false)
              }}
              className='cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10'
            >
              {locale === 'zh' ? '今天' : 'Today'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
