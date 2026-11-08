/**
 * Only allow redirects back into this site.
 *
 * Auth.js will bounce the browser to whatever target it is given after a
 * successful sign-in or sign-out, so accepting an arbitrary string from a form
 * field (or `?callbackUrl=`) would turn those actions into an open redirect.
 */
export function safeCallbackUrl(
  value: FormDataEntryValue | string | readonly string[] | null | undefined,
  fallback = '/'
): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return fallback

  const trimmed = raw.trim()
  if (!trimmed.startsWith('/')) return fallback
  // `//host` and `/\host` are protocol-relative URLs, not site paths.
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) return fallback

  return trimmed
}

/**
 * Callback target after a successful sign-in. Unlike {@link safeCallbackUrl},
 * this never sends a freshly signed-in user back to the login screen.
 */
export function safeLoginRedirect(
  value: FormDataEntryValue | string | readonly string[] | null | undefined,
  fallback = '/'
): string {
  const target = safeCallbackUrl(value, fallback)
  if (
    target === '/admin/login' ||
    target.startsWith('/admin/login?') ||
    target.startsWith('/admin/login#')
  ) {
    return fallback
  }
  return target
}
