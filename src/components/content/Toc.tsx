'use client'

import { useEffect, useRef } from 'react'

import { Trans } from '@/components/i18n/Trans'
import { cn, generateToc } from '@/lib/utils'
import type { Heading, TocItem } from '@/types'

function TocLinks({ items, depth = 0 }: { items: TocItem[]; depth?: number }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.slug}>
          <div className='relative'>
            <span className='toc-bar absolute top-[5%] w-[2px] rounded bg-transparent transition-colors duration-300' />
            <a
              aria-label={`Scroll to section: ${item.text}`}
              className={cn(
                'toc-link ms-2 px-3 py-1 text-foreground/75 transition-all hover:text-foreground',
                depth > 0 && 'ps-7'
              )}
              href={`#${item.slug}`}
            >
              {item.text}
            </a>
          </div>
          {item.subheadings.length > 0 && <TocLinks items={item.subheadings} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}

export function Toc({ headings, className }: { headings: Heading[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const toc = generateToc(headings)

  useEffect(() => {
    const container = containerRef.current
    const content = document.getElementById('content')
    if (!container || !content) return

    const headingElements = Array.from(
      content.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
    ).filter((heading) => heading.id)
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).map(
      (link) => ({
        element: link,
        progressBar: link.previousElementSibling as HTMLElement | null,
        slug: decodeURIComponent((link.getAttribute('href') ?? '').slice(1))
      })
    )

    if (headingElements.length === 0 || links.length === 0) return

    const progressBySlug = new Map<string, { inView: boolean; progress: number }>()
    let frame = 0

    const update = () => {
      frame = 0
      const windowHeight = window.innerHeight
      const pageOffset = window.scrollY - content.offsetTop
      const postOffset = content.offsetHeight + 127

      headingElements.forEach((element, index) => {
        const next = headingElements[index + 1]
        const nextTop = next?.offsetTop ?? postOffset
        const range = [element.offsetTop - pageOffset, nextTop - pageOffset - element.offsetHeight]
        const progress = (windowHeight - range[0]) / (range[1] - range[0])
        progressBySlug.set(element.id, {
          inView: range[0] < windowHeight && range[1] > 0,
          progress: Math.max(0, Math.min(1, progress))
        })
      })

      links.forEach(({ element, progressBar, slug }, index) => {
        const state = progressBySlug.get(slug)
        if (!state || !progressBar) return
        const previous = links[index - 1] ? progressBySlug.get(links[index - 1].slug) : undefined
        const next = links[index + 1] ? progressBySlug.get(links[index + 1].slug) : undefined

        element.classList.toggle('highlight', state.inView)
        element.classList.toggle('highlight-bg-translucent', state.inView)
        element.classList.toggle('rounded-t-2xl', state.inView && !previous?.inView)
        element.classList.toggle('rounded-b-2xl', state.inView && !next?.inView)
        progressBar.classList.toggle('is-read', !state.inView && state.progress === 1)
        progressBar.classList.toggle('highlight-bg', state.inView)
        progressBar.style.height = `${state.progress * 90}%`
      })
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    const onLinkClick = (event: Event) => {
      const anchor = (event.currentTarget as HTMLAnchorElement)
      const slug = decodeURIComponent((anchor.getAttribute('href') ?? '').slice(1))
      const heading = headingElements.find((element) => element.id === slug)
      if (!heading) return
      event.preventDefault()
      history.pushState(null, '', `#${slug}`)
      heading.scrollIntoView({ behavior: 'smooth' })
    }

    links.forEach(({ element }) => element.addEventListener('click', onLinkClick))
    update()
    const interval = window.setInterval(update, 500)
    window.addEventListener('scroll', schedule, { passive: true })

    return () => {
      links.forEach(({ element }) => element.removeEventListener('click', onLinkClick))
      window.clearInterval(interval)
      window.removeEventListener('scroll', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [headings])

  if (toc.length === 0) return null

  return (
    <div ref={containerRef} className={className}>
      <h2 className='text-base font-medium'><Trans en='TABLE OF CONTENTS' zh='目录' /></h2>
      <div className='mt-4'>
        <TocLinks items={toc} />
      </div>
    </div>
  )
}
