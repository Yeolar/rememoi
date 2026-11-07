'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import type { ToastDetail } from '@/lib/toast'

type ToastItem = ToastDetail & { id: number }

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    let counter = 0
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail
      if (!detail?.message) return
      const id = ++counter
      setToasts((items) => [...items, { ...detail, id }])
      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id))
      }, detail.time ?? 3000)
    }
    window.addEventListener('rememoi:toast', onToast)
    return () => window.removeEventListener('rememoi:toast', onToast)
  }, [])

  return (
    <div className='pointer-events-none fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className='animate flex items-center gap-2 rounded-lg border bg-muted px-4 py-2 text-foreground shadow-lg'
          role='status'
        >
          <Icon name='info' className='size-5' />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
