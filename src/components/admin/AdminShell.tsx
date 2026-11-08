import Link from 'next/link'
import type { ReactNode } from 'react'

import { Trans } from '@/components/i18n/Trans'
import { HouseMark } from '@/components/icons/HouseMark'
import { UserMenu, type UserMenuUser } from '@/components/site/UserMenu'

type AdminShellProps = {
  user: UserMenuUser
  children: ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
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
          <Link
            href='/'
            target='_blank'
            rel='noreferrer'
            title='Home'
            className='flex items-center px-1 py-2 text-foreground transition-none hover:text-primary sm:px-2'
          >
            <span className='sr-only'><Trans en='View site' zh='查看站点' /></span>
            <HouseMark className='size-5' />
          </Link>
          <UserMenu user={user} logoutRedirectTo='/admin/login' />
        </div>
      </header>
      {children}
    </div>
  )
}
