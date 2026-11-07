import type { ReactNode } from 'react'

export function pageUrl(basePath: string, page: number) {
  if (page <= 1) return basePath
  return `${basePath}/page/${page}`
}

export function paginationProps(
  basePath: string,
  currentPage: number,
  totalPages: number,
  labels: { prev: ReactNode; next: ReactNode }
) {
  return {
    prevUrl:
      currentPage > 1
        ? { text: labels.prev, url: pageUrl(basePath, currentPage - 1) }
        : undefined,
    nextUrl:
      currentPage < totalPages
        ? { text: labels.next, url: pageUrl(basePath, currentPage + 1) }
        : undefined
  }
}

export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
