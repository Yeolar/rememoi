'use client'

import { useEffect, useRef } from 'react'

import type { WalineEmojiPresets } from '@waline/client'

import siteConfig from '@/config/site'
import { cn } from '@/lib/utils'

type WalineProps = {
  className?: string
}

export function Waline({ className }: WalineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const config = siteConfig.integrations.waline

  useEffect(() => {
    const container = containerRef.current
    if (!config.enable || !config.server || !container) return

    let cancelled = false
    let destroy: (() => void) | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        import('@waline/client').then(({ init }) => {
          if (cancelled) return
          const instance = init({
            el: container,
            serverURL: config.server,
            emoji: config.emoji.map(
              (preset) => `https://cdn.jsdelivr.net/npm/@waline/emojis@1.2.0/${preset}`
            ) as WalineEmojiPresets[],
            reaction: ['/icons/heart-item.svg'],
            locale: config.locale
          })
          destroy = () => instance?.destroy()
        })
      },
      { rootMargin: '200px' }
    )
    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
      destroy?.()
    }
  }, [config])

  if (!config.enable) return null

  return (
    <div id='waline' ref={containerRef} className={cn('not-prose', className)}>
      Comment seems to stuck. Try to refresh?✨
    </div>
  )
}
