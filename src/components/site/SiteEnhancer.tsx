'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { showToast } from '@/lib/toast'

const TAB_STORAGE_PREFIX = 'rememoi-synced-tabs__'

function tabRootOf(element: Element | null) {
  return element?.closest<HTMLElement>('.starlight-tabs') ?? null
}

function panelsOf(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(':scope > [role="tabpanel"]')]
}

function tabsOf(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
}

function activateTab(root: HTMLElement, index: number, options: { focus?: boolean; sync?: boolean } = {}) {
  const tabs = tabsOf(root)
  const panels = panelsOf(root)
  if (!tabs[index]) return
  tabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
    if (selected && options.focus) tab.focus()
  })
  panels.forEach((panel, panelIndex) => {
    panel.hidden = panelIndex !== index
  })
  if (options.focus !== false) {
    const offsetTop = root.getBoundingClientRect().top
    window.requestAnimationFrame(() => {
      const delta = root.getBoundingClientRect().top - offsetTop
      if (delta) window.scrollBy({ top: delta })
    })
  }
  if (options.sync !== false) {
    const key = root.dataset.syncKey
    if (!key) return
    const label = tabs[index]?.textContent?.trim()
    if (!label) return
    try {
      localStorage.setItem(`${TAB_STORAGE_PREFIX}${key}`, label)
    } catch {
      // Storage may be unavailable in private mode.
    }
    document.querySelectorAll<HTMLElement>(`.starlight-tabs[data-sync-key="${CSS.escape(key)}"]`).forEach((other) => {
      if (other === root) return
      const otherTabs = tabsOf(other)
      const otherIndex = otherTabs.findIndex((tab) => tab.textContent?.trim() === label)
      if (otherIndex >= 0) activateTab(other, otherIndex, { focus: false, sync: false })
    })
  }
}

function restoreSyncedTabs() {
  document.querySelectorAll<HTMLElement>('.starlight-tabs[data-sync-key]').forEach((root) => {
    const key = root.dataset.syncKey
    if (!key) return
    let label: string | null = null
    try {
      label = localStorage.getItem(`${TAB_STORAGE_PREFIX}${key}`)
    } catch {
      return
    }
    if (!label) return
    const index = tabsOf(root).findIndex((tab) => tab.textContent?.trim() === label)
    if (index > 0) activateTab(root, index, { focus: false, sync: false })
  })
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return ok
  }
}

/**
 * Site-wide progressive enhancement for server-rendered content:
 * code block copy/collapse controls and accessible tabs.
 */
export function SiteEnhancer() {
  const pathname = usePathname()

  useEffect(() => {
    restoreSyncedTabs()
  }, [pathname])

  useEffect(() => {
    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const copyButton = target.closest<HTMLButtonElement>('button.copy')
      if (copyButton) {
        const code = copyButton.dataset.code ?? ''
        const success = await copyText(code)
        if (success) {
          copyButton.classList.add('copied')
          const timeout = Number(copyButton.dataset.timeout) || 2000
          window.setTimeout(() => copyButton.classList.remove('copied'), timeout)
        } else {
          showToast({ message: 'Copy failed — select the code manually.' })
        }
        return
      }

      const collapseToggle = target.closest<HTMLButtonElement>('.collapse-toggle')
      if (collapseToggle) {
        collapseToggle.closest('.astro-code')?.classList.toggle('collapsed')
        return
      }

      const tab = target.closest<HTMLButtonElement>('[role="tab"]')
      if (tab) {
        event.preventDefault()
        const root = tabRootOf(tab)
        if (!root) return
        const index = tabsOf(root).indexOf(tab)
        if (index >= 0) activateTab(root, index)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const tab = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[role="tab"]')
      if (!tab) return
      const root = tabRootOf(tab)
      if (!root) return
      const tabs = tabsOf(root)
      const current = tabs.indexOf(tab)
      let next: number | null = null
      if (event.key === 'ArrowLeft') next = current - 1
      if (event.key === 'ArrowRight') next = current + 1
      if (event.key === 'Home') next = 0
      if (event.key === 'End') next = tabs.length - 1
      if (next === null) return
      const clamped = (next + tabs.length) % tabs.length
      event.preventDefault()
      activateTab(root, clamped, { focus: true })
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return null
}
