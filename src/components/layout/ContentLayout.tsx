import type { ReactNode } from 'react'

import { FloatingActions } from '@/components/content/FloatingActions'
import { Trans } from '@/components/i18n/Trans'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type ContentLayoutProps = {
  header: ReactNode
  sidebar?: ReactNode
  bottom?: ReactNode
  bottomSidebar?: ReactNode
  backHref?: string
  backTitle?: ReactNode
  backAside?: ReactNode
  lang?: string
  className?: string
  children: ReactNode
}

export function ContentLayout({
  header,
  sidebar,
  bottom,
  bottomSidebar,
  backHref = '/',
  backTitle = <Trans en='Back' zh='返回' />,
  backAside,
  lang,
  className,
  children
}: ContentLayoutProps) {
  return (
    <>
      <div className='flex items-center gap-4'>
        <Button title={backTitle} href={backHref} variant='back' />
        {backAside}
      </div>

      <main className='mt-6 items-start gap-x-10 md:flex'>
        {sidebar && (
          <aside
            className='animate fixed top-20 z-40 min-w-48 basis-60 overflow-y-scroll max-md:hidden max-md:rounded-xl max-md:border max-md:bg-muted max-md:px-4 max-md:py-3 md:sticky md:order-2 lg:shrink-0'
            style={{ height: 'calc(100vh - 7rem)' }}
            id='sidebar'
          >
            {sidebar}
          </aside>
        )}
        <div
          id='sidebar-shade'
          className='fixed start-0 top-0 h-full w-full'
          style={{ display: 'none', backgroundColor: '#00000091', zIndex: 31 }}
        />

        <article data-pagefind-body lang={lang} className='min-w-0 grow'>
          <div id='content-header' className='animate'>
            {header}
          </div>

          <div
            id='content'
            className={cn(
              'prose animate mt-8 max-w-none overflow-x-hidden text-base md:min-w-[45ch]',
              className
            )}
          >
            {children}
          </div>
        </article>
      </main>

      {bottom && (
        <div className='bottom mt-6 items-start gap-x-10 md:flex'>
          <div className='flex-1 text-muted-foreground md:min-w-[50ch]'>{bottom}</div>
          <div className='min-w-48 basis-60'>{bottomSidebar}</div>
        </div>
      )}

      <FloatingActions
        headerId='content-header'
        contentId='content'
        showSidebarButton={Boolean(sidebar)}
      />
    </>
  )
}
