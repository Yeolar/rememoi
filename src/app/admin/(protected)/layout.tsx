import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { auth, isAuthConfigured } from '@/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { SetupNotice } from '@/components/admin/SetupNotice'

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  if (!isAuthConfigured) {
    return <SetupNotice />
  }

  const session = await auth()
  if (!session) redirect('/admin/login?callbackUrl=/admin')

  const sessionUser = session.user
  const user = {
    name: sessionUser?.name || sessionUser?.login || sessionUser?.email || null,
    login: sessionUser?.login ?? null,
    image: sessionUser?.image ?? null
  }

  return <AdminShell user={user}>{children}</AdminShell>
}
