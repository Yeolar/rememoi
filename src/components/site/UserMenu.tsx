'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

import { logout } from '@/app/admin/actions'
import { Trans } from '@/components/i18n/Trans'
import { LogOutMark } from '@/components/icons/LogOutMark'
import { UserRoundMark } from '@/components/icons/UserRoundMark'
import { UserRoundPenMark } from '@/components/icons/UserRoundPenMark'
import { useLocale } from '@/lib/use-locale'
import { cn } from '@/lib/utils'

export type UserMenuUser = {
  name?: string | null
  login?: string | null
  image?: string | null
}

type UserMenuProps = {
  user: UserMenuUser | null
  /** Target after signing out. Defaults to the homepage. */
  logoutRedirectTo?: string
  className?: string
}

/** Same size, padding and hover treatment as the search icon in the header. */
const SEARCH_LIKE_CLASS = 'px-1 py-2 transition-none hover:text-primary sm:px-2'

export function UserMenu({ user, logoutRedirectTo = '/', className }: UserMenuProps) {
  const locale = useLocale()
  const menuId = useId()
  const buttonId = `${menuId}-button`
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) {
    const label = locale === 'zh' ? '登录' : 'Sign in'

    return (
      <Link
        href='/admin/login'
        title={label}
        aria-label={label}
        className={cn(SEARCH_LIKE_CLASS, 'flex items-center', className)}
      >
        <UserRoundMark className='size-5' />
      </Link>
    )
  }

  const handle = user.login?.trim() ?? ''
  const displayName =
    user.name?.trim() ||
    handle ||
    (locale === 'zh' ? '已登录' : 'Signed in')
  const showHandle = handle.length > 0 && handle !== displayName
  const avatarLabel = locale === 'zh' ? '账户菜单' : 'Account menu'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        id={buttonId}
        type='button'
        title={displayName}
        aria-label={avatarLabel}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(SEARCH_LIKE_CLASS, 'flex cursor-pointer items-center')}
      >
        {user.image ? (
          <img
            src={user.image}
            alt=''
            width={24}
            height={24}
            referrerPolicy='no-referrer'
            className='size-6 rounded-full object-cover'
          />
        ) : (
          <span
            aria-hidden
            className='flex size-6 select-none items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground'
          >
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role='menu'
          aria-labelledby={buttonId}
          className='absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border bg-background p-1.5 shadow-lg'
        >
          <div role='presentation' className='border-b border-border/70 px-2.5 pb-2 pt-1'>
            <p className='truncate text-sm font-medium text-foreground'>{displayName}</p>
            {showHandle && <p className='truncate text-xs text-muted-foreground'>@{handle}</p>}
          </div>

          <Link
            href='/admin'
            role='menuitem'
            onClick={() => setOpen(false)}
            className='mt-1 flex items-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <UserRoundPenMark className='size-4' />
            <Trans en='Admin' zh='管理后台' />
          </Link>

          <form action={logout}>
            <input type='hidden' name='redirectTo' value={logoutRedirectTo} />
            <button
              type='submit'
              role='menuitem'
              className='flex w-full cursor-pointer items-center gap-x-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <LogOutMark className='size-4' />
              <Trans en='Sign out' zh='退出登录' />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
