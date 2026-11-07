import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth, isAuthConfigured, isDevLoginEnabled, isGithubConfigured } from '@/auth'
import { SetupNotice } from '@/components/admin/SetupNotice'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false }
}

export default async function LoginPage() {
  if (!isAuthConfigured) return <SetupNotice />

  const session = await auth()
  if (session) redirect('/admin')

  return (
    <div className='flex min-h-[100dvh] w-full items-center justify-center px-4 py-10'>
      <div className='w-full max-w-sm rounded-2xl border bg-background p-6 shadow-sm'>
        <div className='mb-6 text-center'>
          <Link href='/' className='text-2xl font-medium'>
            Rememoi
          </Link>
          <p className='mt-1 text-sm text-muted-foreground'>Sign in to write and publish.</p>
        </div>

        <LoginForm showGithub={isGithubConfigured} showDev={isDevLoginEnabled} />

        {isDevLoginEnabled && (
          <p className='mt-6 rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground'>
            Local login: username <code className='font-semibold'>admin</code>, password from{' '}
            <code className='font-semibold'>ADMIN_DEV_PASSWORD</code> (default{' '}
            <code className='font-semibold'>rememoi</code>). This login is disabled in production
            unless <code>ENABLE_DEV_LOGIN=true</code>.
          </p>
        )}

        <p className='mt-6 text-center text-xs text-muted-foreground'>
          <Link href='/'>← Back to the site</Link>
        </p>
      </div>
    </div>
  )
}
