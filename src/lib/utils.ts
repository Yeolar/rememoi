import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import siteConfig from '@/config/site'
import type { Heading, TocItem } from '@/types'

/** Merge tailwind classes, last one wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateFormat = new Intl.DateTimeFormat(
  siteConfig.locale.dateLocale,
  siteConfig.locale.dateOptions
)

export function getFormattedDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
) {
  const value = new Date(date)
  if (options) {
    return value.toLocaleDateString(siteConfig.locale.dateLocale, {
      ...siteConfig.locale.dateOptions,
      ...options
    })
  }
  return dateFormat.format(value)
}

export function getChineseDate(date: Date | string | number) {
  const value = new Date(date)
  return `${value.getFullYear()}年${value.getMonth() + 1}月${value.getDate()}日`
}

export function getDateISO(date: Date | string | number) {
  return new Date(date).toISOString()
}

export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

// CJK character ranges
const CJK_RANGES = [
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0x3400, 0x4dbf], // CJK Extension A
  [0x20000, 0x2a6df], // CJK Extension B
  [0x2a700, 0x2b73f], // CJK Extension C
  [0x2b740, 0x2b81f], // CJK Extension D
  [0x2b820, 0x2ceaf], // CJK Extension E
  [0xf900, 0xfaff], // CJK Compatibility Ideographs
  [0x2f800, 0x2fa1f] // CJK Compatibility Ideographs Supplement
]
// CJK punctuation ranges
const CJK_PUNCTUATION = /[\u3000-\u303F\uff00-\uffef]/

function isCJK(char: string): boolean {
  const code = char.charCodeAt(0)
  return CJK_RANGES.some(([start, end]) => code >= start && code <= end)
}

/**
 * Reading time with CJK support (same behaviour as the Astro Pure theme).
 */
export function getReadingTime(text: string, wordsPerMinute = 200) {
  let words = 0
  let inWord = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (isCJK(char)) {
      words++
      while (i + 1 < text.length && CJK_PUNCTUATION.test(text[i + 1])) i++
      inWord = false
    } else if (/\S/.test(char)) {
      if (!inWord) {
        words++
        inWord = true
      }
    } else {
      inWord = false
    }
  }

  const minutes = words / wordsPerMinute
  return {
    text: `${Math.ceil(minutes)} min`,
    minutes,
    words
  }
}

/** Build a nested table of contents out of flat markdown headings. */
export function generateToc(headings: readonly Heading[]): TocItem[] {
  const root: TocItem = { depth: 0, slug: 'root', text: 'Root', subheadings: [] }
  const stack: TocItem[] = [root]

  for (const heading of headings) {
    const item: TocItem = { ...heading, subheadings: [] }
    while (stack[stack.length - 1].depth >= item.depth) stack.pop()
    stack[stack.length - 1].subheadings.push(item)
    stack.push(item)
  }
  return root.subheadings
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function formatMinutes(minutes: number) {
  return `${Math.ceil(minutes)} min`
}
