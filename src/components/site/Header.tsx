'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import { TornadoMark } from '@/components/icons/TornadoMark'
import { UserMenu, type UserMenuUser } from '@/components/site/UserMenu'
import siteConfig from '@/config/site'
import { cn } from '@/lib/utils'

const NAV_LABELS: Record<string, { en: string; zh: string }> = {
  Memory: { en: 'Memory', zh: '记忆' },
  Archive: { en: 'Archive', zh: '归档' },
  Projects: { en: 'Projects', zh: '项目' },
  About: { en: 'About', zh: '关于' }
}

type HeaderProps = {
  /** Signed-in user from the server session; `null` renders the sign-in entry. */
  user?: UserMenuUser | null
}

export function Header({ user = null }: HeaderProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <header
      className='site-header group relative z-50 mb-12 mt-4 flex items-center justify-between rounded-xl border border-transparent max-sm:py-1 sm:rounded-2xl max-md:z-30'
    >
      <Link
        className='z-30 flex items-center gap-2 text-xl font-medium'
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
              <Trans en={NAV_LABELS[item.title]?.en ?? item.title} zh={NAV_LABELS[item.title]?.zh ?? item.title} />
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
                  <Trans en={NAV_LABELS[item.title]?.en ?? item.title} zh={NAV_LABELS[item.title]?.zh ?? item.title} />
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
          <UserMenu user={user} />
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
