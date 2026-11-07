import Link from 'next/link'

import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { Icon } from '@/components/icons/Icon'
import { getFormattedDate } from '@/lib/utils'
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
          <h1 className='text-2xl font-medium'>Posts</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {posts.length} total · {published} published · {drafts} draft{drafts === 1 ? '' : 's'} · {privatePosts} private
          </p>
        </div>
        <Link
          href='/admin/posts/new'
          className='flex items-center gap-2 rounded-lg border bg-foreground px-4 py-2 text-sm font-medium text-background no-underline transition-opacity hover:opacity-90'
        >
          <Icon name='document' className='size-4' />
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className='rounded-2xl border border-dashed p-10 text-center'>
          <p className='text-lg font-medium'>No posts yet</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Create your first post, or run{' '}
            <code className='rounded bg-muted px-1.5 py-0.5'>pnpm db:seed</code> to import the
            Markdown files from <code className='rounded bg-muted px-1.5 py-0.5'>content/blog</code>.
          </p>
          <Link
            href='/admin/posts/new'
            className='mt-4 inline-flex rounded-lg border bg-muted px-4 py-2 text-sm no-underline hover:bg-card'
          >
            Write a post
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
                    {post.status}
                  </span>
                  {post.pinned && (
                    <span className='rounded-full border px-2 py-0.5 text-xs text-muted-foreground'>
                      pinned
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
                  /blog/{post.slug} · updated {getFormattedDate(post.updatedAt)} ·{' '}
                  {post.tags.length > 0 ? post.tags.join(', ') : 'no tags'}
                </p>
              </div>
              <div className='flex shrink-0 flex-wrap items-center gap-2'>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className='rounded-lg border bg-muted px-2 py-1 text-xs text-foreground no-underline transition-colors hover:bg-card'
                >
                  Edit
                </Link>
                <Link
                  href={`/preview/${post.id}`}
                  target='_blank'
                  className='rounded-lg border px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-muted'
                >
                  Preview
                </Link>
                {post.status === 'published' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target='_blank'
                    className='rounded-lg border px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-muted'
                  >
                    Live
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
