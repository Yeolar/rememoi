type Tool = {
  name: string
  description: string
  href: string
  icon: string
}

type ToolSectionProps = {
  title: string
  tools: Tool[]
  className?: string
}

export function ToolSection({ title, tools, className }: ToolSectionProps) {
  return (
    <div
      className={`not-prose flex flex-col gap-y-3 rounded-xl border px-3 py-3 sm:gap-y-4 ${className ?? ''}`}
    >
      <div className='m-0 px-2 text-lg font-medium'>{title}</div>
      <div className='grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2'>
        {tools.map((tool) => (
          <a
            key={tool.name}
            className='group relative text-sm leading-normal no-underline'
            href={tool.href}
            target='_blank'
            rel='noopener noreferrer'
          >
            <div className='flex items-center gap-x-3 rounded-lg border border-transparent px-1.5 py-1 transition-colors hover:border-border hover:bg-muted'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-card p-2'>
                <img src={tool.icon} alt={tool.name} className='h-full w-full object-contain' />
              </div>
              <div className='z-20 flex flex-col'>
                <div className='font-medium text-foreground'>{tool.name}</div>
                <div className='font-normal'>{tool.description}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
