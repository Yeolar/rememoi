'use server'

import { AuthError } from 'next-auth'

import { signIn, signOut } from '@/auth'
import { safeCallbackUrl, safeLoginRedirect } from '@/lib/auth-redirect'

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
      redirectTo: safeLoginRedirect(formData.get('callbackUrl'))
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

export async function loginWithGithub(formData: FormData) {
  await signIn('github', { redirectTo: safeLoginRedirect(formData.get('callbackUrl')) })
}

export async function logout(formData?: FormData) {
  await signOut({ redirectTo: safeCallbackUrl(formData?.get('redirectTo')) })
}
