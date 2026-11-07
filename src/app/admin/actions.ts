'use server'

import { AuthError } from 'next-auth'

import { signIn, signOut } from '@/auth'

export type LoginState = {
  error?: string
}

export async function loginWithCredentials(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirectTo: '/admin'
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid username or password.' }
    }
    // `signIn` throws a redirect on success — let Next.js handle it.
    throw error
  }
  return {}
}

export async function loginWithGithub() {
  await signIn('github', { redirectTo: '/admin' })
}

export async function logout() {
  await signOut({ redirectTo: '/admin/login' })
}
