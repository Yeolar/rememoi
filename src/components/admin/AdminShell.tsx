import Link from 'next/link'
import type { ReactNode } from 'react'

import { logout } from '@/app/admin/actions'
import { LocaleButton } from '@/components/i18n/LocaleButton'
import { Trans } from '@/components/i18n/Trans'

type AdminShellProps = {
  user: string
  provider?: string
  children: ReactNode
}

export function AdminShell({ user, provider, children }: AdminShellProps) {
  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-6 sm:px-8'>
      <header className='mb-8 flex flex-wrap items-center justify-between gap-4 pb-4'>
        <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
          <Link href='/admin' className='text-lg font-medium no-underline'>
            Rememoi <span className='text-muted-foreground'><Trans en='Admin' zh='管理后台' /></span>
          </Link>
          <nav className='flex items-center gap-x-3 text-sm'>
            <Link href='/admin'><Trans en='Posts' zh='文章' /></Link>
            <Link href='/admin/posts/new'><Trans en='New post' zh='新建文章' /></Link>
          </nav>
        </div>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
          <span>
            {user}
            {provider === 'credentials' ? <Trans en=' (local)' zh='（本地）' /> : ''}
          </span>
          <Link href='/' target='_blank' className='text-foreground'>
            <Trans en='View site ↗' zh='查看站点 ↗' />
          </Link>
          <LocaleButton />
          <form action={logout}>
            <button
              type='submit'
              className='cursor-pointer rounded-lg border bg-muted px-2 py-1 text-xs transition-colors hover:bg-card'
            >
              <Trans en='Sign out' zh='退出登录' />
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  )
}
