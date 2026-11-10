import { timingSafeEqual } from 'node:crypto'

import { auth, isAuthConfigured } from '@/auth'

/**
 * Write access can be granted either by an Auth.js admin session (the browser
 * admin) or by a server-side API token (automation / agents).
 *
 * Set `REMEMOI_API_TOKEN` on the server and send:
 *   Authorization: Bearer <REMEMOI_API_TOKEN>
 */
const API_TOKEN_ENV = 'REMEMOI_API_TOKEN'

export function isApiTokenConfigured() {
  return Boolean(process.env[API_TOKEN_ENV])
}

function bearerToken(request?: Request) {
  const header = request?.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function tokensMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(providedBuffer, expectedBuffer)
}

/** Returns the admin session, or null when browser auth is not configured. */
export async function getAdminSession() {
  if (!isAuthConfigured) return null
  return auth()
}

/** True when the current request is signed in as the admin (may see private posts). */
export async function canViewPrivatePosts() {
  return Boolean(await getAdminSession())
}

export type AdminAuth =
  | { session: Awaited<ReturnType<typeof auth>>; via: 'session' }
  | { session: null; via: 'token' }

/**
 * API guard for write operations. Returns `error` when the request is not
 * authenticated; callers should return it directly.
 */
export async function requireAdmin(request?: Request): Promise<AdminAuth | { error: Response }> {
  const expectedToken = process.env[API_TOKEN_ENV]
  const providedToken = bearerToken(request)

  if (expectedToken && providedToken && tokensMatch(providedToken, expectedToken)) {
    return { session: null, via: 'token' }
  }

  if (isAuthConfigured) {
    const session = await auth()
    if (session) return { session, via: 'session' }
  }

  if (!isAuthConfigured && !expectedToken) {
    return {
      error: Response.json(
        {
          error: 'auth_not_configured',
          message:
            'Configure AUTH_SECRET and a login provider, or set REMEMOI_API_TOKEN for API access.'
        },
        { status: 503 }
      )
    }
  }

  return {
    error: Response.json(
      {
        error: 'unauthorized',
        message:
          'Provide a valid Authorization: Bearer <REMEMOI_API_TOKEN> header, or sign in as an admin.'
      },
      { status: 401 }
    )
  }
}
