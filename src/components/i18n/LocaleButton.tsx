'use client'

import { useCallback } from 'react'

import { LanguagesMark } from '@/components/icons/LanguagesMark'

export function LocaleButton() {
  const toggleLocale = useCallback(() => {
    const root = document.documentElement
    const next = root.dataset.locale === 'zh' ? 'en' : 'zh'
    root.dataset.locale = next
    root.lang = next === 'zh' ? 'zh-CN' : 'en'
    try {
      localStorage.setItem('locale', next)
    } catch {
      // ignore storage errors
    }
    window.dispatchEvent(new Event('rememoi:locale'))
  }, [])

  return (
    <button
      type='button'
      id='toggleLocale'
      onClick={toggleLocale}
      className='flex cursor-pointer items-center transition-colors hover:text-primary'
    >
      <span className='sr-only'>Switch language</span>
      <LanguagesMark />
    </button>
  )
}
