import { cn } from '@/lib/utils'
import type { FriendListData } from '@/types'

type FriendListProps = {
  list: FriendListData
  className?: string
}

export function FriendList({ list, className }: FriendListProps) {
  return (
    <div className={cn('grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3', className)}>
      {list.link_list.length > 0 ? (
        list.link_list.map((friend) => (
          <a
            key={friend.link}
            href={friend.link}
            target='_blank'
            rel='noopener noreferrer'
            className='no-underline'
          >
            <div className='group relative h-full overflow-hidden rounded-2xl border bg-background px-2.5 py-1.5 transition-colors hover:bg-muted sm:px-4 sm:py-2'>
              <div className='relative z-10 flex h-full items-center gap-3'>
                <div className='relative h-14 w-14 min-w-14 overflow-hidden rounded-full'>
                  <div
                    role='img'
                    aria-label={`${friend.name} avatar`}
                    className='h-14 w-14 rounded-full bg-card bg-cover bg-center'
                    style={{ backgroundImage: `url(${friend.avatar})` }}
                  />
                  <div className='absolute start-0 top-0 h-full w-full'>
                    <div className='flex h-full w-full items-center justify-center rounded-full bg-foreground opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-50'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='32'
                        height='32'
                        viewBox='0 0 24 24'
                        fill='none'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='me-2 stroke-background'
                      >
                        <line
                          x1='5'
                          y1='12'
                          x2='19'
                          y2='12'
                          className='translate-x-4 scale-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-x-100'
                        />
                        <polyline
                          points='12 5 19 12 12 19'
                          className='translate-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-y-1'>
                  <p className='my-0 line-clamp-1 text-sm'>{friend.name}</p>
                  <p className='my-0 line-clamp-1 text-xs text-muted-foreground'>{friend.intro}</p>
                </div>
              </div>
              <div
                aria-hidden='true'
                className='absolute -start-2 top-0 z-0 h-full w-2/3 bg-white opacity-[0.15]'
                style={{
                  backgroundImage: `url(${friend.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  maskImage: 'linear-gradient(to left, transparent 0%, black 100%)',
                  WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 100%)'
                }}
              />
            </div>
          </a>
        ))
      ) : (
        <p>Nothing here.</p>
      )}
    </div>
  )
}
