'use client'

import { logout } from '@/app/admin/actions'
import { LogOutMark } from '@/components/icons/LogOutMark'
import { useLocale } from '@/lib/use-locale'

export function AdminLogOutButton() {
  const locale = useLocale()
  const label = locale === 'zh' ? '退出登录' : 'Sign out'

  return (
    <form action={logout}>
      <button
        type='submit'
        aria-label={label}
        title={label}
        className='box-content size-5 cursor-pointer rounded-md border p-1.5 transition-colors hover:bg-border sm:rounded-xl'
      >
        <LogOutMark className='size-5' />
      </button>
    </form>
  )
}
