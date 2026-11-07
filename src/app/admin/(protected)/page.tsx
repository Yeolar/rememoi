import Link from 'next/link'

import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { LocalizedDate } from '@/components/i18n/LocalizedDate'
import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import { POST_STATUS_LABELS } from '@/lib/post-status'
import { listAdminPosts } from '@/lib/admin-posts'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const posts = await listAdminPosts()
  const published = posts.filter((post) => post.status === 'published').length
  const drafts = posts.filter((post) => post.status === 'draft').length
  const privatePosts = posts.filter((post) => post.status === 'private').length

  return (
    <div>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-medium'><Trans en='Posts' zh='文章' /></h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            <Trans
              en={<>{posts.length} total · {published} published · {drafts} draft{drafts === 1 ? '' : 's'} · {privatePosts} private</>}
              zh={<>共 {posts.length} 篇 · {published} 篇已发布 · {drafts} 篇草稿 · {privatePosts} 篇私有</>}
            />
          </p>
        </div>
        <Link
          href='/admin/posts/new'
          className='flex items-center gap-2 rounded-lg border bg-foreground px-4 py-2 text-sm font-medium text-background no-underline transition-opacity hover:opacity-90'
        >
          <Icon name='document' className='size-4' />
          <Trans en='New post' zh='新建文章' />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className='rounded-2xl border border-dashed p-10 text-center'>
          <p className='text-lg font-medium'><Trans en='No posts yet' zh='还没有文章' /></p>
          <p className='mt-1 text-sm text-muted-foreground'>
            <Trans
              en={<>Create your first post, or run <code className='rounded bg-muted px-1.5 py-0.5'>pnpm db:seed</code> to import the Markdown files from <code className='rounded bg-muted px-1.5 py-0.5'>content/blog</code>.</>}
              zh={<>创建第一篇文章，或运行 <code className='rounded bg-muted px-1.5 py-0.5'>pnpm db:seed</code> 从 <code className='rounded bg-muted px-1.5 py-0.5'>content/blog</code> 导入 Markdown 文件。</>}
            />
          </p>
          <Link
            href='/admin/posts/new'
            className='mt-4 inline-flex rounded-lg border bg-muted px-4 py-2 text-sm no-underline hover:bg-card'
          >
            <Trans en='Write a post' zh='写一篇文章' />
          </Link>
        </div>
      ) : (
        <ul className='divide-y rounded-2xl border bg-background'>
          {posts.map((post) => (
            <li
              key={post.id}
              className='flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5'
            >
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span
                    className={
                      post.status === 'published'
                        ? 'rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-700 dark:text-green-300'
                        : post.status === 'private'
                          ? 'rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300'
                          : 'rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300'
                    }
                  >
                    <Trans en={POST_STATUS_LABELS[post.status].en} zh={POST_STATUS_LABELS[post.status].zh} />
                  </span>
                  {post.pinned && (
                    <span className='rounded-full border px-2 py-0.5 text-xs text-muted-foreground'>
                      <Trans en='pinned' zh='置顶' />
                    </span>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className='truncate font-medium text-foreground no-underline hover:text-primary'
                  >
                    {post.title}
                  </Link>
                </div>
                <p className='mt-1 truncate text-xs text-muted-foreground'>
                  /blog/{post.slug} · <Trans en='updated ' zh='更新于 ' />
                  <LocalizedDate date={post.updatedAt} /> ·{' '}
                  {post.tags.length > 0 ? post.tags.join(', ') : <Trans en='no tags' zh='无标签' />}
                </p>
              </div>
              <div className='flex shrink-0 flex-wrap items-center gap-2'>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className='rounded-lg border bg-muted px-2 py-1 text-xs text-foreground no-underline transition-colors hover:bg-card'
                >
                  <Trans en='Edit' zh='编辑' />
                </Link>
                <Link
                  href={`/preview/${post.id}`}
                  target='_blank'
                  className='rounded-lg border px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-muted'
                >
                  <Trans en='Preview' zh='预览' />
                </Link>
                {post.status === 'published' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target='_blank'
                    className='rounded-lg border px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-muted'
                  >
                    <Trans en='Live' zh='查看线上' />
                  </Link>
                )}
                <DeletePostButton id={post.id} title={post.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
