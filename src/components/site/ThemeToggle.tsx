'use client'

import { useCallback, useEffect, useRef } from 'react'

import { Icon } from '@/components/icons/Icon'
import { showToast } from '@/lib/toast'

type Theme = 'system' | 'light' | 'dark'
const THEMES: Theme[] = ['system', 'dark', 'light']

function resolveTheme(theme: Theme) {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme, persist: boolean) {
  const resolved = resolveTheme(theme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#0B0B10' : '#FCFCFD')
  if (persist) {
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore storage errors
    }
  }
}

export function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system'
    const next = THEMES.includes(stored) ? stored : 'system'
    if (buttonRef.current) buttonRef.current.dataset.theme = next
    applyTheme(next, false)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (((localStorage.getItem('theme') as Theme | null) ?? 'system') === 'system') {
        applyTheme('system', false)
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const cycleTheme = useCallback(() => {
    const current = (buttonRef.current?.dataset.theme as Theme | undefined) ?? 'system'
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
    applyTheme(next, true)
    if (buttonRef.current) buttonRef.current.dataset.theme = next
    showToast({ message: `Set theme to ${next}` })
  }, [])

  return (
    <button
      ref={buttonRef}
      type='button'
      id='toggleDarkMode'
      data-theme='system'
      onClick={cycleTheme}
      className='theme-toggle flex cursor-pointer items-center transition-colors hover:text-primary'
    >
      <span className='sr-only'>Dark Theme</span>
      <Icon className='icon-system' name='computer' />
      <Icon className='icon-light' name='sun' />
      <Icon className='icon-dark' name='moon' />
    </button>
  )
}
