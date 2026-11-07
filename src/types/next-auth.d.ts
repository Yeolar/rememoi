import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      login?: string | null
      provider?: string
    } & DefaultSession['user']
  }

  interface User {
    login?: string | null
    provider?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    login?: string | null
    provider?: string
  }
}
