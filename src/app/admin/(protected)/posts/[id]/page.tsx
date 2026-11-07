import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostEditor } from '@/components/admin/PostEditor'
import { getAdminPost } from '@/lib/admin-posts'

export const dynamic = 'force-dynamic'

type EditPostPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getAdminPost(id)
  return { title: post ? `Edit: ${post.title}` : 'Edit post' }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const post = await getAdminPost(id)
  if (!post) notFound()
  return <PostEditor mode='edit' post={post} />
}
