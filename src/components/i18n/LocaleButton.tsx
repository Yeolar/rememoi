'use client'

import { useCallback } from 'react'

import { LanguagesMark } from '@/components/icons/LanguagesMark'

const LOCALE_BUTTON_CLASS =
  'box-content size-5 cursor-pointer rounded-md border p-1.5 transition-colors hover:bg-border sm:rounded-xl'

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
      aria-label='Switch language'
      className={LOCALE_BUTTON_CLASS}
    >
      <LanguagesMark className='size-5' />
    </button>
  )
}
