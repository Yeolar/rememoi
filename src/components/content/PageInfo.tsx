'use client'

import { useEffect, useId, useRef } from 'react'

import { Trans } from '@/components/i18n/Trans'
import siteConfig from '@/config/site'
import { cn } from '@/lib/utils'

type PageInfoProps = {
  comment?: boolean
  className?: string
}

export function PageInfo({ comment, className }: PageInfoProps) {
  const rawId = useId()
  const id = `pageinfo${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const config = siteConfig.integrations.waline
  const startRef = useRef(false)

  useEffect(() => {
    if (!config.enable || !config.server || startRef.current) return
    startRef.current = true
    const path = window.location.pathname
    const update = !['localhost', '127.0.0.1'].includes(window.location.hostname)
    const aborts: Array<() => void> = []

    Promise.all([import('@waline/client/pageview'), import('@waline/client/comment')]).then(
      ([{ pageviewCount }, { commentCount }]) => {
        aborts.push(
          pageviewCount({
            serverURL: config.server,
            path,
            update,
            selector: `#${id} .waline-pageview-count`
          })
        )
        if (comment) {
          aborts.push(
            commentCount({
              serverURL: config.server,
              path,
              selector: `#${id} .waline-comment-count`
            })
          )
        }
      }
    )

    return () => {
      aborts.forEach((abort) => abort())
    }
  }, [comment, config.enable, config.server, id])

  if (!config.enable) return null

  return (
    <div
      id={id}
      className={cn('text-sm text-muted-foreground', className)}
      data-server-url={config.server}
    >
      <span className='waline-pageview-count' /> <Trans en='views' zh='次浏览' />
      {comment && (
        <>
          <span> | </span>
          <a href='#waline'>
            <span className='waline-comment-count' /> <Trans en='comments' zh='条评论' />
          </a>
        </>
      )}
    </div>
  )
}
