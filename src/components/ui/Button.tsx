import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type ButtonVariant = 'button' | 'pill' | 'back' | 'ahead'

type ButtonProps = {
  as?: 'a' | 'button'
  href?: string
  target?: string
  rel?: string
  title?: string
  variant?: ButtonVariant
  className?: string
  children?: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  'aria-label'?: string
}

function BackArrow() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='stroke-muted-foreground transition-colors group-hover:stroke-primary'
    >
      <line
        x1='19'
        y1='12'
        x2='5'
        y2='12'
        className='translate-x-3 scale-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:scale-x-100'
      />
      <polyline
        points='12 19 5 12 12 5'
        className='translate-x-1 transition-all duration-300 ease-in-out group-hover:translate-x-0'
      />
    </svg>
  )
}

function AheadArrow() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='stroke-muted-foreground transition-colors group-hover:stroke-primary'
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
  )
}

export function Button({
  as,
  href,
  target,
  rel,
  title,
  variant = 'button',
  className,
  children,
  onClick,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  const classes = cn(
    'group inline-flex items-center gap-x-1 rounded-lg bg-muted border px-2 py-1 text-sm text-muted-foreground transition-all hover:bg-card no-underline',
    !href && as !== 'button' && 'cursor-default',
    variant === 'pill' && 'rounded-xl',
    className
  )
  const content = (
    <>
      {variant === 'back' && <BackArrow />}
      {children ?? (title ? <p className='my-0'>{title}</p> : null)}
      {variant === 'ahead' && <AheadArrow />}
    </>
  )

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes} onClick={onClick} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={cn(classes, 'cursor-pointer')} onClick={onClick} disabled={disabled} {...rest}>
      {content}
    </button>
  )
}
