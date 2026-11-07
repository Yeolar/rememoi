import type { SVGProps } from 'react'

import { Icons, type IconsType } from './icons'
import { cn } from '@/lib/utils'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconsType
  label?: string
  color?: string
  size?: string
}

export function Icon({ name, label, color, size = '1em', className, style, ...props }: IconProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      width={22}
      height={22}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('icon', className)}
      style={
        {
          '--icon-color': color,
          '--icon-size': size,
          ...style
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: Icons[name] }}
      {...props}
    />
  )
}

export type { IconsType }
