export function SetupNotice() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10 sm:px-8'>
      <h1 className='text-2xl font-medium'>Admin is almost ready</h1>
      <p className='mt-2 text-muted-foreground'>
        The public site works without authentication, but the editor needs a secret and at least one
        login method.
      </p>

      <div className='mt-6 space-y-4 rounded-2xl border bg-muted/40 p-5 text-sm'>
        <div>
          <h2 className='font-medium'>1. Create a GitHub OAuth app</h2>
          <p className='mt-1 text-muted-foreground'>
            Authorization callback URL:{' '}
            <code className='rounded bg-muted px-1.5 py-0.5'>
              http://localhost:3000/api/auth/callback/github
            </code>{' '}
            (use your production domain when deploying).
          </p>
        </div>
        <div>
          <h2 className='font-medium'>2. Add these values to `.env.local`</h2>
          <pre className='mt-2 overflow-x-auto rounded-xl border bg-background p-3 text-xs'>
{`AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_GITHUB_ID=your-oauth-client-id
AUTH_GITHUB_SECRET=your-oauth-client-secret
ADMIN_GITHUB_LOGINS=Yeolar
# optional: local username/password login (dev only by default)
# ADMIN_DEV_PASSWORD=rememoi
# DATABASE_URL=file:./data/rememoi.db
# DATABASE_AUTH_TOKEN=only-for-remote-libsql`}
          </pre>
        </div>
        <div>
          <h2 className='font-medium'>3. Restart the dev server</h2>
          <p className='mt-1 text-muted-foreground'>
            Run <code className='rounded bg-muted px-1.5 py-0.5'>pnpm dev</code> and open{' '}
            <code className='rounded bg-muted px-1.5 py-0.5'>/admin/login</code>.
          </p>
        </div>
      </div>

      <p className='mt-6 text-sm text-muted-foreground'>
        In development a local login is enabled automatically: username{' '}
        <code className='rounded bg-muted px-1.5 py-0.5'>admin</code>, password from{' '}
        <code className='rounded bg-muted px-1.5 py-0.5'>ADMIN_DEV_PASSWORD</code> (default{' '}
        <code className='rounded bg-muted px-1.5 py-0.5'>rememoi</code>).
      </p>
    </div>
  )
}
