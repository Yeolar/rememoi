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
  if (!session) redirect('/admin/login')

  const user =
    session.user?.login || session.user?.name || session.user?.email || 'Signed-in admin'

  return (
    <AdminShell user={user} provider={session.user?.provider}>
      {children}
    </AdminShell>
  )
}
