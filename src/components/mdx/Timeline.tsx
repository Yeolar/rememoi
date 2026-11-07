import { Trans } from '@/components/i18n/Trans'
import type { TimelineEvent } from '@/types'

type TimelineProps = {
  events: TimelineEvent[]
  className?: string
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={className}>
      <ul className='ps-0 sm:ps-2'>
        {events.map((event, index) => (
          <li key={`${event.date}-${index}`} className='group relative flex list-none gap-x-3 rounded-full ps-0 sm:gap-x-2'>
            <span className='z-10 my-2 ms-2 h-3 w-3 min-w-3 rounded-full border-2 border-muted-foreground transition-transform group-hover:scale-125' />
            {index !== events.length - 1 && (
              <span
                className='absolute start-[12px] top-[20px] w-1 bg-border'
                style={{ height: 'calc(100% - 4px)' }}
              />
            )}
            <div className='flex gap-2 max-sm:flex-col'>
              <samp className='w-fit grow-0 rounded-md py-1 text-sm max-sm:bg-card max-sm:px-2 sm:min-w-[82px] sm:text-right'>
                {event.date}
              </samp>
              <div>
                <Trans
                  en={<span dangerouslySetInnerHTML={{ __html: event.content }} />}
                  zh={
                    <span
                      dangerouslySetInnerHTML={{ __html: event.contentZh ?? event.content }}
                    />
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
