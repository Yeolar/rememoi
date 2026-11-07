import Link from 'next/link'

import { cn } from '@/lib/utils'

type ProjectCardProps = {
  href: string
  heading: string
  subheading: string
  imagePath: string
  altText?: string
  className?: string
  external?: boolean
}

export function ProjectCard({
  href,
  heading,
  subheading,
  imagePath,
  altText,
  className,
  external = true
}: ProjectCardProps) {
  const content = (
    <>
      <img
        src={imagePath}
        alt={altText ?? heading}
        loading='lazy'
        className='absolute h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100 dark:opacity-35'
      />
      <div className='project-card-fg z-10 flex flex-col gap-y-0.5 px-5 pb-4 pt-36 transition-all'>
        <h2 className='text-lg font-medium'>{heading}</h2>
        <p className='text-muted-foreground'>{subheading}</p>
      </div>
    </>
  )

  const classes = cn(
    'project-card group relative flex flex-col justify-end overflow-hidden rounded-2xl border bg-muted no-underline',
    'transition-all hover:border-foreground/25 hover:shadow-sm',
    className
  )

  if (external) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' className={classes}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}
