'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

type FloatingActionsProps = {
  headerId: string
  contentId: string
  showSidebarButton?: boolean
}

export function FloatingActions({
  headerId,
  contentId,
  showSidebarButton = false
}: FloatingActionsProps) {
  const [visible, setVisible] = useState(false)
  const [percent, setPercent] = useState(0)
  const [ended, setEnded] = useState(false)
  const ticking = useRef(false)

  const calculatePercent = useCallback(() => {
    const content = document.getElementById(contentId)
    if (!content) return 0
    const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop)
    const articleTop = content.offsetTop
    if (scrollTop < articleTop) return 0
    const maxScrollable = content.scrollHeight - document.documentElement.clientHeight
    if (maxScrollable <= 0) return 100
    const progress = Math.min(scrollTop - articleTop, maxScrollable)
    return Math.round((progress / maxScrollable) * 100)
  }, [contentId])

  useEffect(() => {
    const header = document.getElementById(headerId)
    if (!header) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setVisible(!entry.isIntersecting))
      },
      { rootMargin: '0px' }
    )
    observer.observe(header)

    const updatePercent = () => {
      const next = calculatePercent()
      setPercent(next)
      setEnded(next >= 100)
      ticking.current = false
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(updatePercent)
    }

    updatePercent()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [calculatePercent, headerId])

  const toggleSidebar = useCallback((force?: boolean) => {
    const sidebar = document.getElementById('sidebar')
    const shade = document.getElementById('sidebar-shade')
    if (!sidebar || !shade) return
    const open = force ?? !sidebar.classList.contains('show')
    sidebar.classList.toggle('show', open)
    shade.style.display = open ? 'block' : 'none'
    document.body.style.overflow = open ? 'hidden' : ''
  }, [])

  useEffect(() => {
    const shade = document.getElementById('sidebar-shade')
    if (!shade) return
    const onShadeClick = () => toggleSidebar(false)
    shade.addEventListener('click', onShadeClick)
    return () => {
      shade.removeEventListener('click', onShadeClick)
      document.body.style.overflow = ''
    }
  }, [toggleSidebar])

  return (
    <div
      id='action-buttons'
      className={cn(
        'group fixed bottom-8 end-4 z-10 flex flex-col gap-y-4 transition-all duration-300 sm:end-8 md:z-50',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-16'
      )}
    >
      {showSidebarButton && (
        <button
          type='button'
          aria-label='Toggle sidebar'
          onClick={() => toggleSidebar()}
          className='flex size-10 items-center justify-center rounded-full border-2 border-transparent bg-muted text-muted-foreground duration-300 hover:border-border/75 sm:size-12 md:hidden'
        >
          <Icon name='list' />
        </button>
      )}

      <button
        type='button'
        aria-label='Back to Top'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          'relative flex size-10 items-center justify-center rounded-full border-2 border-transparent bg-muted text-muted-foreground duration-300 hover:border-border/75 sm:size-12',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
            ended ? 'opacity-0' : 'opacity-100'
          )}
        >
          <span>{percent}</span>
          <span className='text-xs'>%</span>
        </div>
        <Icon
          name='up'
          className={cn(
            'transition-opacity duration-150',
            ended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        />
      </button>
    </div>
  )
}
