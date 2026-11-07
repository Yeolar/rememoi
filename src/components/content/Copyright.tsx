'use client'

import { useState } from 'react'

import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import siteConfig from '@/config/site'
import { LocalizedDate } from '@/components/i18n/LocalizedDate'
import type { Post } from '@/types'

type CopyrightProps = {
  post: Post
  url: string
}

const shareLabels = {
  weibo: 'Weibo',
  x: 'X',
  bluesky: 'Bluesky'
} as const

export function Copyright({ post, url }: CopyrightProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [qrData, setQrData] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const heroImage = post.heroImage?.src ?? ''
  const shareLinks = {
    weibo: `http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title)}&pic=${encodeURIComponent(heroImage)}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(`'${post.title}'`)}&url=${encodeURIComponent(url)}&via=${encodeURIComponent(siteConfig.author)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${post.title}\n${url}`)}`
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      window.dispatchEvent(
        new CustomEvent('rememoi:toast', { detail: { message: 'Link copied!' } })
      )
    } catch {
      window.dispatchEvent(
        new CustomEvent('rememoi:toast', {
          detail: { message: 'Copy failed — copy the URL from the address bar.' }
        })
      )
    }
  }

  const toggleQr = async () => {
    const next = !qrOpen
    setQrOpen(next)
    if (next && !qrData) {
      const QRCode = await import('qrcode')
      const data = await QRCode.toDataURL(url, {
        margin: 1,
        width: 352,
        color: { dark: '#0b0b10', light: '#ffffff' }
      })
      setQrData(data)
    }
  }

  return (
    <div>
      <div className='relative flex flex-col gap-y-2 rounded-xl border px-3 py-2 sm:px-4 sm:py-3'>
        <Icon className='absolute end-4 top-4 size-20 opacity-10' name='copyright' />

        <div className='flex flex-col'>
          <div className='font-medium text-foreground'>{post.title}</div>
          <div className='line-clamp-1 text-sm'>{url}</div>
        </div>

        <div className='flex flex-row flex-wrap justify-start gap-x-5 gap-y-1 sm:gap-x-8'>
          <div className='flex gap-x-2 sm:flex-col'>
            <span><Trans en='Author' zh='作者' /></span>
            <span className='text-sm text-foreground max-sm:place-self-center'>
              {siteConfig.author}
            </span>
          </div>
          <div className='flex gap-x-2 sm:min-w-16 sm:flex-col'>
            <span><Trans en='Published at' zh='发布于' /></span>
            <span className='text-sm text-foreground max-sm:place-self-center'>
              <LocalizedDate date={post.publishDate} dateTimeOptions={{ month: 'long' }} />
            </span>
          </div>
          <div className='flex gap-x-2 sm:flex-col'>
            <span><Trans en='Copyright' zh='版权' /></span>
            <a
              className='text-sm text-foreground max-sm:place-self-center'
              href='https://creativecommons.org/licenses/by/4.0/'
              target='_blank'
              rel='noopener noreferrer'
            >
              CC BY-NC-SA 4.0
            </a>
          </div>
        </div>

        <div className='relative'>
          <div className='flex flex-row gap-3'>
            <button
              type='button'
              aria-label={copied ? 'Link copied' : 'Copy link'}
              onClick={copyLink}
              className='group cursor-pointer rounded-full bg-muted p-1 text-muted-foreground transition-colors hover:text-primary sm:p-1.5'
            >
              <Icon className='size-5' name='link' />
            </button>
            <button
              type='button'
              aria-label='Get QR code'
              aria-expanded={qrOpen}
              onClick={toggleQr}
              className='group cursor-pointer rounded-full bg-muted p-1 text-muted-foreground transition-colors hover:text-primary sm:p-1.5'
            >
              <Icon className='size-5' name='qrcode' />
            </button>
            {siteConfig.content.share.map((share) => (
              <a
                key={share}
                href={shareLinks[share]}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`Share to ${shareLabels[share]}`}
                className='group rounded-full bg-muted p-1 text-muted-foreground transition-colors hover:text-primary sm:p-1.5'
              >
                <Icon className='size-5' name={share} />
              </a>
            ))}
          </div>
          <div
            className={`absolute z-10 -mt-2 box-content max-h-0 max-w-44 overflow-hidden rounded-xl border bg-muted p-4 opacity-0 transition-all duration-300 ease-in-out ${
              qrOpen ? 'expanded max-h-44 translate-y-1.5 opacity-100' : ''
            }`}
          >
            {qrData ? (
              <img src={qrData} alt='QR code for this post' width={176} height={176} />
            ) : (
              <div className='flex h-44 w-44 items-center justify-center text-sm text-muted-foreground'>
                <Trans en='Generating…' zh='生成中…' />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mx-6 rounded-b-xl border border-t-0 px-3 pb-1.5 pt-1 sm:mx-8 sm:px-4'>
        <a
          href='/about#say-hello'
          className='flex items-center justify-between text-muted-foreground no-underline'
        >
          <span><Trans en='Say hello ☕' zh='打个招呼 ☕' /></span>
          <Icon className='box-content size-5 p-1' name='receive-money' />
        </a>
      </div>
    </div>
  )
}
