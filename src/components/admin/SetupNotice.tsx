import { Trans } from '@/components/i18n/Trans'

export function SetupNotice() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10 sm:px-8'>
      <h1 className='text-2xl font-medium'>
        <Trans en='Admin is almost ready' zh='管理后台即将就绪' />
      </h1>
      <p className='mt-2 text-muted-foreground'>
        <Trans
          en='The public site works without authentication, but the editor needs a secret and at least one login method.'
          zh='公开站点无需登录即可使用，但编辑器需要配置密钥和至少一种登录方式。'
        />
      </p>

      <div className='mt-6 space-y-4 rounded-2xl border bg-muted/40 p-5 text-sm'>
        <div>
          <h2 className='font-medium'>
            <Trans en='1. Create a GitHub OAuth app' zh='1. 创建 GitHub OAuth 应用' />
          </h2>
          <p className='mt-1 text-muted-foreground'>
            <Trans
              en={<>Authorization callback URL: <code className='rounded bg-muted px-1.5 py-0.5'>http://localhost:3000/api/auth/callback/github</code> (use your production domain when deploying).</>}
              zh={<>授权回调 URL：<code className='rounded bg-muted px-1.5 py-0.5'>http://localhost:3000/api/auth/callback/github</code>（部署时请换成生产域名）。</>}
            />
          </p>
        </div>
        <div>
          <h2 className='font-medium'>
            <Trans en='2. Add these values to .env.local' zh='2. 将这些值添加到 .env.local' />
          </h2>
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
          <h2 className='font-medium'>
            <Trans en='3. Restart the dev server' zh='3. 重启开发服务器' />
          </h2>
          <p className='mt-1 text-muted-foreground'>
            <Trans
              en={<>Run <code className='rounded bg-muted px-1.5 py-0.5'>pnpm dev</code> and open <code className='rounded bg-muted px-1.5 py-0.5'>/admin/login</code>.</>}
              zh={<>运行 <code className='rounded bg-muted px-1.5 py-0.5'>pnpm dev</code> 并打开 <code className='rounded bg-muted px-1.5 py-0.5'>/admin/login</code>。</>}
            />
          </p>
        </div>
      </div>

      <p className='mt-6 text-sm text-muted-foreground'>
        <Trans
          en={<>In development a local login is enabled automatically: username <code className='rounded bg-muted px-1.5 py-0.5'>admin</code>, password from <code className='rounded bg-muted px-1.5 py-0.5'>ADMIN_DEV_PASSWORD</code> (default <code className='rounded bg-muted px-1.5 py-0.5'>rememoi</code>).</>}
          zh={<>开发环境会自动启用本地登录：用户名 <code className='rounded bg-muted px-1.5 py-0.5'>admin</code>，密码来自 <code className='rounded bg-muted px-1.5 py-0.5'>ADMIN_DEV_PASSWORD</code>（默认 <code className='rounded bg-muted px-1.5 py-0.5'>rememoi</code>）。</>}
        />
      </p>
    </div>
  )
}
