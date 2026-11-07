'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 60_000)
  return () => window.clearInterval(timer)
}

function getSnapshot() {
  return new Date().getFullYear()
}

function getServerSnapshot() {
  return new Date().getFullYear()
}

export function CurrentYear() {
  const year = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return <span suppressHydrationWarning>{year}</span>
}
