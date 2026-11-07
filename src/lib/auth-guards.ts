import { isAuthConfigured, auth } from '@/auth'

/** Returns the admin session, or null when auth is not configured. */
export async function getAdminSession() {
  if (!isAuthConfigured) return null
  return auth()
}

/** API guard: returns a Response when the caller is not an authenticated admin. */
export async function requireAdmin(): Promise<{ session: Awaited<ReturnType<typeof auth>> } | { error: Response }> {
  if (!isAuthConfigured) {
    return {
      error: Response.json(
        {
          error: 'auth_not_configured',
          message: 'Configure AUTH_SECRET and GitHub OAuth (or enable the dev login) first.'
        },
        { status: 503 }
      )
    }
  }
  const session = await auth()
  if (!session) {
    return { error: Response.json({ error: 'unauthorized' }, { status: 401 }) }
  }
  return { session }
}
