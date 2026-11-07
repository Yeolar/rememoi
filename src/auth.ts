import type { NextRequest } from 'next/server'
import NextAuth, { type Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'

/**
 * Auth setup for the admin area.
 *
 * - GitHub OAuth with an explicit login allowlist (recommended for production)
 * - a credentials provider for local development (disabled in production unless
 *   ENABLE_DEV_LOGIN=true)
 *
 * NextAuth is initialised lazily so the public site also builds and runs when no
 * auth environment variables are configured yet.
 */

const devFallbackSecret = 'rememoi-development-only-secret-change-me'
const secret =
  process.env.AUTH_SECRET || (process.env.NODE_ENV !== 'production' ? devFallbackSecret : undefined)

export const isGithubConfigured = Boolean(
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
)
export const isDevLoginEnabled =
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_LOGIN === 'true'
export const isAuthConfigured = Boolean(secret) && (isGithubConfigured || isDevLoginEnabled)

export const githubAllowlist = (process.env.ADMIN_GITHUB_LOGINS ?? '')
  .split(',')
  .map((login) => login.trim().toLowerCase())
  .filter(Boolean)

const devPassword = process.env.ADMIN_DEV_PASSWORD || 'rememoi'

function buildProviders() {
  const providers = []

  if (isGithubConfigured) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!
      })
    )
  }

  if (isDevLoginEnabled) {
    providers.push(
      Credentials({
        id: 'credentials',
        name: 'Local admin',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          const username = typeof credentials?.username === 'string' ? credentials.username : ''
          const password = typeof credentials?.password === 'string' ? credentials.password : ''
          if (username === 'admin' && password === devPassword) {
            return {
              id: 'local-admin',
              name: 'Local Admin',
              email: 'admin@rememoi.local'
            }
          }
          return null
        }
      })
    )
  }

  return providers
}

type AuthInstance = ReturnType<typeof NextAuth>

let instance: AuthInstance | null = null

function getInstance(): AuthInstance {
  if (!instance) {
    instance = NextAuth({
      secret: secret ?? 'rememoi-unconfigured',
      trustHost: true,
      session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
      pages: { signIn: '/admin/login' },
      providers: buildProviders(),
      callbacks: {
        async signIn({ account, profile }) {
          if (account?.provider === 'github') {
            const login = String((profile as { login?: string } | undefined)?.login ?? '')
              .trim()
              .toLowerCase()
            // Refuse all GitHub logins when no allowlist was configured.
            return githubAllowlist.includes(login)
          }
          return true
        },
        async jwt({ token, account, profile }) {
          if (account?.provider === 'github') {
            token.provider = 'github'
            token.login = String((profile as { login?: string } | undefined)?.login ?? '')
          }
          if (account?.provider === 'credentials') {
            token.provider = 'credentials'
            token.login = 'admin'
          }
          return token
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.login = typeof token.login === 'string' ? token.login : null
            session.user.provider =
              typeof token.provider === 'string' ? token.provider : undefined
          }
          return session
        }
      }
    })
  }
  return instance
}

/** Route handlers for /api/auth/[...nextauth]. */
function notConfigured() {
  return Response.json(
    { error: 'auth_not_configured', message: 'Configure AUTH_SECRET and a login provider first.' },
    { status: 503 }
  )
}

export const handlers = {
  GET: (request: NextRequest) =>
    isAuthConfigured ? getInstance().handlers.GET(request) : notConfigured(),
  POST: (request: NextRequest) =>
    isAuthConfigured ? getInstance().handlers.POST(request) : notConfigured()
}

/** Session getter; returns null when auth is not configured. */
export async function auth(): Promise<Session | null> {
  if (!isAuthConfigured) return null
  return getInstance().auth()
}

export async function signIn(...args: Parameters<AuthInstance['signIn']>) {
  return getInstance().signIn(...args)
}

export async function signOut(...args: Parameters<AuthInstance['signOut']>) {
  return getInstance().signOut(...args)
}

export type { Session }
