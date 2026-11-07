import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type TabItemProps = {
  label: string
  children?: ReactNode
}

/** Marker component used by <Tabs>; it never renders on its own. */
export function TabItem({ children }: TabItemProps) {
  return <>{children}</>
}

type TabsProps = {
  syncKey?: string
  className?: string
  children?: ReactNode
}

function hash(value: string) {
  let result = 0
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(result).toString(36)
}

export function Tabs({ syncKey, className, children }: TabsProps) {
  const items = Children.toArray(children).filter(
    (child): child is ReactElement<TabItemProps> =>
      isValidElement(child) && typeof (child.props as TabItemProps)?.label === 'string'
  )

  if (items.length === 0) return <>{children}</>

  const id = `tabs-${syncKey ?? ''}-${hash(items.map((item) => item.props.label).join('|'))}`

  return (
    <div className={cn('starlight-tabs my-4 block', className)} data-sync-key={syncKey}>
      <div className='tablist-wrapper not-content overflow-x-auto'>
        <ul role='tablist' className='not-prose my-0 flex list-none border-b-2 border-border p-0'>
          {items.map((item, index) => (
            <li
              key={`${item.props.label}-${index}`}
              role='presentation'
              className='tab -mb-0.5'
            >
              <button
                type='button'
                role='tab'
                id={`${id}-tab-${index}`}
                aria-controls={`${id}-panel-${index}`}
                aria-selected={index === 0}
                tabIndex={index === 0 ? 0 : -1}
                data-tab-index={index}
                className='flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-5 py-[0.2rem] text-foreground transition-colors aria-selected:border-primary aria-selected:font-semibold aria-selected:text-primary'
              >
                {item.props.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {items.map((item, index) => (
        <div
          key={`${item.props.label}-panel-${index}`}
          role='tabpanel'
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== 0}
          className='mt-4'
        >
          {item.props.children}
        </div>
      ))}
    </div>
  )
}
