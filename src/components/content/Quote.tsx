'use client'

import { useEffect, useState } from 'react'

import siteConfig from '@/config/site'
import { cn } from '@/lib/utils'

type QuoteProps = {
  className?: string
}

export function Quote({ className }: QuoteProps) {
  const [text, setText] = useState('Loading...')

  useEffect(() => {
    const controller = new AbortController()
    const { server, fallback } = siteConfig.integrations.quote
    fetch(server, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { quote?: string }) => {
        const quote = data.quote
        if (!quote) throw new Error('Invalid quote response')
        setText(quote.length > 80 ? `${quote.slice(0, 80)}...` : quote)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setText(fallback[Math.floor(Math.random() * fallback.length)])
      })
    return () => controller.abort()
  }, [])

  return (
    <div className={cn('not-prose inline-block', className)}>
      <div className='flex flex-row items-center gap-x-3 rounded-full border px-4 py-2 text-sm shadow-sm'>
        <span className='relative flex items-center justify-center'>
          <span className='absolute size-2 animate-ping rounded-full border border-green-400 bg-green-400 opacity-75' />
          <span className='size-2 rounded-full bg-green-400' />
        </span>
        <p className='font-medium text-muted-foreground'>{text}</p>
      </div>
    </div>
  )
}
