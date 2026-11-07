import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

type SkillLayoutProps = {
  title: ReactNode
  skills: string[]
}

export function SkillLayout({ title, skills }: SkillLayoutProps) {
  return (
    <div className='flex flex-col gap-y-2 md:flex-row md:gap-x-5 md:gap-y-0'>
      <h3 className='w-1/5 font-medium'>{title}</h3>
      <div className='flex flex-row flex-wrap gap-x-4 gap-y-2 md:w-4/5'>
        {skills.map((skill) => (
          <Button key={skill} title={skill} variant='pill' />
        ))}
      </div>
    </div>
  )
}
