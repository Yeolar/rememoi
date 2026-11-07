'use client'

import { useState } from 'react'

type CopyableValueProps = {
  value: string
}

export function CopyableValue({ value }: CopyableValueProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      window.dispatchEvent(
        new CustomEvent('rememoi:toast', {
          detail: { message: `Copied "${value}" to clipboard!` }
        })
      )
    } catch {
      window.dispatchEvent(
        new CustomEvent('rememoi:toast', { detail: { message: 'Copy failed.' } })
      )
    }
  }

  return (
    <samp
      className='cursor-pointer break-all hover:text-primary'
      role='button'
      tabIndex={0}
      onClick={copy}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') copy()
      }}
      title='Click to copy'
    >
      {copied ? 'Copied!' : value}
    </samp>
  )
}
