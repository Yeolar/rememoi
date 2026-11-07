import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth, isAuthConfigured } from '@/auth'
import { PostArticle } from '@/components/blog/PostArticle'
import { Trans } from '@/components/i18n/Trans'
import { getAdminPost } from '@/lib/admin-posts'
import { POST_STATUS_LABELS } from '@/lib/post-status'
import { getPostBySlug } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false }
}

type PreviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  if (!isAuthConfigured) redirect('/admin/login')
  const session = await auth()
  if (!session) redirect(`/admin/login?callbackUrl=/preview`)

  const { id } = await params
  const adminPost = await getAdminPost(id)
  if (!adminPost) notFound()

  const post = await getPostBySlug(adminPost.slug, { includePrivate: true })
  if (!post) notFound()

  return (
    <>
      <div className='mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200'>
        <span>
          <Trans en='Preview mode' zh='预览模式' /> ·{' '}
          <Trans en={POST_STATUS_LABELS[post.status].en} zh={POST_STATUS_LABELS[post.status].zh} /> ·{' '}
          {post.title}
        </span>
        <span className='text-xs opacity-80'>
          <Trans en='Only you can see this page.' zh='只有你能看到此页面。' />
        </span>
      </div>
      <PostArticle post={post} preview backHref={`/admin/posts/${post.id}`} backTitle={<Trans en='Back to editor' zh='返回编辑器' />} />
    </>
  )
}
