'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import { TornadoMark } from '@/components/icons/TornadoMark'
import siteConfig from '@/config/site'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

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

export function Header() {
  const themeButtonRef = useRef<HTMLButtonElement>(null)
  const [notTop, setNotTop] = useState(false)
  const [show, setShow] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const previousScroll = useRef(0)

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system'
    const next = THEMES.includes(stored) ? stored : 'system'
    if (themeButtonRef.current) themeButtonRef.current.dataset.theme = next
    applyTheme(next, false)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      setNotTop(current > 20)
      setShow(current < 350 || current < previousScroll.current)
      previousScroll.current = current
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
    const current =
      (themeButtonRef.current?.dataset.theme as Theme | undefined) ?? 'system'
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
    applyTheme(next, true)
    if (themeButtonRef.current) themeButtonRef.current.dataset.theme = next
    showToast({ message: `Set theme to ${next}` })
  }, [])

  return (
    <header
      className={cn(
        'site-header group sticky top-4 z-50 mb-12 flex items-center justify-between rounded-xl border border-transparent max-sm:py-1 sm:rounded-2xl max-md:z-30',
        notTop && 'not-top',
        !show && !expanded && 'header-hidden'
      )}
    >
      <Link
        className={cn(
          'z-30 flex items-center gap-2 text-xl font-medium transition-[margin] duration-300',
          notTop && 'ms-2 sm:ms-3'
        )}
        href='/'
        aria-label='Rememoi home'
      >
        <TornadoMark className='size-6' />
        <span>{siteConfig.title}</span>
      </Link>

      <div className='flex items-center gap-x-2'>
        {/* Desktop menu */}
        <nav className='hidden items-center sm:flex' aria-label='Main navigation'>
          {siteConfig.header.menu.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setExpanded(false)}
              className='w-full flex-none grow py-2 text-right font-medium transition-none hover:text-primary sm:w-fit sm:px-3'
            >
              {item.title}
            </Link>
          ))}
          <Link
            className='px-1 py-2 transition-none hover:text-primary sm:px-2'
            href='/search'
            title='Search'
            onClick={() => setExpanded(false)}
          >
            <span className='sr-only'>Search</span>
            <Icon name='search' className='size-5' />
          </Link>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn('site-menu sm:hidden', expanded && 'expanded')}
          id='headerExpandContent'
          inert={!expanded}
        >
          <nav className='site-menu-inner' aria-label='Mobile navigation'>
            <div className='flex flex-col items-center justify-center overflow-hidden'>
              {siteConfig.header.menu.map((item) => (
                <Link
                  key={item.link}
                  href={item.link}
                  onClick={() => setExpanded(false)}
                  className='w-full flex-none grow py-2 text-right font-medium transition-none hover:text-primary'
                >
                  {item.title}
                </Link>
              ))}
              <div className='flex w-full grow flex-row justify-end gap-x-3'>
                <Link
                  className='px-1 py-2'
                  href='/search'
                  title='Search'
                  onClick={() => setExpanded(false)}
                >
                  <span className='sr-only'>Search</span>
                  <Icon name='search' className='size-5' />
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className='z-30 flex gap-x-4'>
          <button
            ref={themeButtonRef}
            type='button'
            id='toggleDarkMode'
            data-theme='system'
            onClick={cycleTheme}
            className='theme-toggle box-content size-5 cursor-pointer rounded-md border p-1.5 transition-colors hover:bg-border sm:rounded-xl'
          >
            <span className='sr-only'>Dark Theme</span>
            <Icon className='icon-system size-5 hover:text-primary' name='computer' />
            <Icon className='icon-light size-5 hover:text-primary' name='sun' />
            <Icon className='icon-dark size-5 hover:text-primary' name='moon' />
          </button>
          <button
            type='button'
            id='toggleMenu'
            aria-expanded={expanded}
            aria-controls='headerExpandContent'
            onClick={() => setExpanded((value) => !value)}
            className='cursor-pointer rounded-md border p-1.5 transition-colors hover:bg-border sm:hidden'
          >
            <span className='sr-only'>Menu</span>
            <Icon className='size-5' name='menu' />
          </button>
        </div>
      </div>
    </header>
  )
}
