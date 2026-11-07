'use client'

import { useEffect } from 'react'

import siteConfig from '@/config/site'

export function MediumZoom() {
  useEffect(() => {
    if (!siteConfig.integrations.mediumZoom.enable) return
    let cleanup: (() => void) | undefined
    let cancelled = false

    import('medium-zoom').then(({ default: mediumZoom }) => {
      if (cancelled) return
      const zoom = mediumZoom(siteConfig.integrations.mediumZoom.selector, {
        background: 'hsl(var(--background) / 0.8)'
      })
      cleanup = () => zoom.detach()
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return null
}
