'use client'

import { useActionState } from 'react'

import {
  loginWithCredentials,
  loginWithGithub,
  type LoginState
} from '@/app/admin/actions'
import { Icon } from '@/components/icons/Icon'

type LoginFormProps = {
  showGithub: boolean
  showDev: boolean
}

const initialState: LoginState = {}

export function LoginForm({ showGithub, showDev }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginWithCredentials, initialState)

  return (
    <div className='flex flex-col gap-5'>
      {showGithub && (
        <form action={loginWithGithub}>
          <button
            type='submit'
            className='flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-card'
          >
            <Icon name='github' className='size-5' />
            Continue with GitHub
          </button>
        </form>
      )}

      {showGithub && showDev && (
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <span className='h-px flex-1 bg-border' />
          or use the local account
          <span className='h-px flex-1 bg-border' />
        </div>
      )}

      {showDev && (
        <form action={formAction} className='flex flex-col gap-3'>
          <label className='field'>
            <span className='field-label'>Username</span>
            <input
              className='field-input'
              name='username'
              defaultValue='admin'
              autoComplete='username'
              required
            />
          </label>
          <label className='field'>
            <span className='field-label'>Password</span>
            <input
              className='field-input'
              type='password'
              name='password'
              autoComplete='current-password'
              required
            />
          </label>
          {state.error && <p className='text-sm text-red-500'>{state.error}</p>}
          <button
            type='submit'
            disabled={pending}
            className='cursor-pointer rounded-lg border bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  )
}
