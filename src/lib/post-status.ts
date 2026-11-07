import type { PostStatus } from '@/types'

export const POST_STATUS_LABELS: Record<PostStatus, { en: string; zh: string }> = {
  draft: { en: 'Draft', zh: '草稿' },
  published: { en: 'Published', zh: '已发布' },
  private: { en: 'Private', zh: '私有' }
}
