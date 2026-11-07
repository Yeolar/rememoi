import type { ReactNode } from 'react'

/**
 * Renders both UI languages and lets CSS show the active one. This keeps
 * server components static while allowing instant client-side switching.
 */
export function Trans({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  return (
    <span className='i18n'>
      <span lang='en' data-lang='en'>{en}</span>
      <span lang='zh-CN' data-lang='zh'>{zh}</span>
    </span>
  )
}
