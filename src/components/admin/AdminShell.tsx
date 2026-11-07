import Link from 'next/link'
import type { ReactNode } from 'react'

import { logout } from '@/app/admin/actions'

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
            Rememoi <span className='text-muted-foreground'>Admin</span>
          </Link>
          <nav className='flex items-center gap-x-3 text-sm'>
            <Link href='/admin'>Posts</Link>
            <Link href='/admin/posts/new'>New post</Link>
          </nav>
        </div>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
          <span>
            {user}
            {provider === 'credentials' ? ' (local)' : ''}
          </span>
          <Link href='/' target='_blank' className='text-foreground'>
            View site ↗
          </Link>
          <form action={logout}>
            <button
              type='submit'
              className='cursor-pointer rounded-lg border bg-muted px-2 py-1 text-xs transition-colors hover:bg-card'
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  )
}
