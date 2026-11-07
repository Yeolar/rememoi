import type { IconsType } from '@/components/icons/Icon'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

const projectIconSet: Record<string, IconsType> = {
  github: 'github-circle',
  site: 'earth',
  doc: 'document',
  release: 'package'
}

type ProjectSectionProps = {
  projects: Project[]
  className?: string
}

export function ProjectSection({ projects, className }: ProjectSectionProps) {
  return (
    <div className={className}>
      <div className='grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-4'>
        {projects.map((project) => (
          <div key={project.name} className='relative overflow-hidden rounded-xl border'>
            {project.image && (
              <img
                src={`/images/projects/${project.image}`}
                alt={project.name}
                loading='lazy'
                className='absolute end-0 z-0 m-0 h-full w-1/2 object-cover opacity-40'
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 100%)'
                }}
              />
            )}
            <div
              className={cn(
                'relative z-10 flex flex-col gap-y-1 px-2 py-1.5 sm:px-3 sm:py-2',
                project.image && 'me-20'
              )}
            >
              <a
                className='line-clamp-1 font-medium text-foreground no-underline transition-colors'
                href={project.links[0].href}
                target='_blank'
                rel='noopener noreferrer'
              >
                {project.name}
              </a>
              <div className='line-clamp-2 leading-snug text-muted-foreground sm:h-12'>
                {project.description}
              </div>
              <div className='flex flex-row items-center gap-x-2 sm:gap-x-3'>
                {project.links.map((link) => (
                  <a
                    key={`${link.type}-${link.href}`}
                    href={link.href}
                    className='rounded-full bg-muted p-1 text-muted-foreground transition-colors sm:p-1.5'
                    aria-label={link.type}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Icon className='size-5' name={projectIconSet[link.type] ?? 'link'} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
