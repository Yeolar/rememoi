import type { Metadata } from 'next'

import { PostEditor } from '@/components/admin/PostEditor'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'New post'
}

export default function NewPostPage() {
  return <PostEditor mode='create' />
}
