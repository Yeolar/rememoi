'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import { Trans } from '@/components/i18n/Trans'
import { useLocale } from '@/lib/use-locale'
import { cn } from '@/lib/utils'

type DeletePostButtonProps = {
  id: string
  title: string
  redirectTo?: string
  className?: string
  children?: ReactNode
}

export function DeletePostButton({
  id,
  title,
  redirectTo,
  className,
  children
}: DeletePostButtonProps) {
  const router = useRouter()
  const locale = useLocale()
  const [deleting, setDeleting] = useState(false)

  const onDelete = async () => {
    const confirmMessage =
      locale === 'zh'
        ? `删除“${title}”？此操作无法撤销。`
        : `Delete “${title}”? This cannot be undone.`
    if (!window.confirm(confirmMessage)) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || (locale === 'zh' ? '删除失败' : 'Delete failed'))
      }
      window.dispatchEvent(
        new CustomEvent('rememoi:toast', {
          detail: { message: locale === 'zh' ? '文章已删除。' : 'Post deleted.' }
        })
      )
      if (redirectTo) router.push(redirectTo)
      router.refresh()
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('rememoi:toast', {
          detail: {
            message:
              error instanceof Error
                ? error.message
                : locale === 'zh'
                  ? '删除失败。'
                  : 'Delete failed.'
          }
        })
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type='button'
      onClick={onDelete}
      disabled={deleting}
      className={cn(
        'cursor-pointer rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400',
        className
      )}
    >
      {deleting ? <Trans en='Deleting…' zh='删除中…' /> : children ?? <Trans en='Delete' zh='删除' />}
    </button>
  )
}
