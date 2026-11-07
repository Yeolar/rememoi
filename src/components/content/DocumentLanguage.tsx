'use client'

import { useEffect } from 'react'

import siteConfig from '@/config/site'

/**
 * The root <html lang> is fixed by the root layout, so article pages sync the
 * document language after hydration and restore the site default on unmount.
 */
export function DocumentLanguage({ language }: { language?: string }) {
  useEffect(() => {
    const root = document.documentElement
    const fallback = siteConfig.locale.lang
    if (language) root.lang = language
    else root.lang = fallback
    return () => {
      root.lang = fallback
    }
  }, [language])

  return null
}
