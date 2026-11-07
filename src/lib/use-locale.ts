'use client'

import { useEffect, useState } from 'react'

export type Locale = 'en' | 'zh'

function readLocale(): Locale {
  return document.documentElement.dataset.locale === 'zh' ? 'zh' : 'en'
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    const sync = () => setLocale(readLocale())
    sync()
    window.addEventListener('rememoi:locale', sync)
    return () => window.removeEventListener('rememoi:locale', sync)
  }, [])

  return locale
}
