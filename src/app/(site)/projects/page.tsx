import { Toc } from '@/components/content/Toc'
import { Trans } from '@/components/i18n/Trans'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { ProjectSection } from '@/components/projects/ProjectSection'
import { buildMetadata } from '@/lib/metadata'
import type { Heading, Project } from '@/types'

export const metadata = buildMetadata({
  title: 'Projects',
  description: 'Things I build, learn from and keep around.',
  path: '/projects'
})

const headings: Heading[] = [
  { depth: 2, slug: 'programs', text: 'Programs' },
  { depth: 2, slug: 'learnings', text: 'Learnings' },
  { depth: 2, slug: 'others', text: 'Others' },
  { depth: 2, slug: 'stack', text: 'Stack' }
]

const programs: Project[] = [
  {
    name: '📔 Rememoi',
    description: 'A personal blog with a design-led reading experience and a small self-hosted editor.',
    links: [
      { type: 'github', href: 'https://github.com/Yeolar/rememoi' },
      { type: 'site', href: '/' }
    ]
  },
  {
    name: '✍️ Rememoi Admin',
    description: 'The editing surface: Markdown drafts, image uploads, publish controls and API access.',
    links: [{ type: 'github', href: 'https://github.com/Yeolar/rememoi/tree/main/src/app/admin' }]
  }
]

const learnings: Project[] = [
  {
    name: '🎨 Astro Theme Pure',
    description: 'The clean Astro blog theme whose design language this site is built on.',
    links: [
      { type: 'github', href: 'https://github.com/cworld1/astro-theme-pure' },
      { type: 'site', href: 'https://astro-pure.js.org/' },
      { type: 'doc', href: 'https://astro-pure.js.org/docs/list' }
    ]
  },
  {
    name: '▲ Next.js',
    description: 'The App Router, server components and route handlers power this site.',
    links: [
      { type: 'github', href: 'https://github.com/vercel/next.js' },
      { type: 'site', href: 'https://nextjs.org/' },
      { type: 'doc', href: 'https://nextjs.org/docs' }
    ]
  },
  {
    name: '🌈 Shiki',
    description: 'Beautiful syntax highlighting, with dual themes and line-level transformers.',
    links: [
      { type: 'github', href: 'https://github.com/shikijs/shiki' },
      { type: 'doc', href: 'https://shiki.style/' }
    ]
  }
]

const others: Project[] = [
  {
    name: 'Yeolar on GitHub',
    description: 'Code, experiments and the occasional unfinished idea.',
    links: [{ type: 'github', href: 'https://github.com/Yeolar' }]
  },
  {
    name: 'RSS feed',
    description: 'Follow new posts without an account.',
    links: [{ type: 'site', href: '/rss.xml' }]
  }
]

export default function ProjectsPage() {
  return (
    <ContentLayout
      backHref='/'
      sidebar={<Toc headings={headings} />}
      header={<h1 className='text-2xl font-medium sm:mb-2 sm:text-3xl'><Trans en='Projects' zh='项目' /></h1>}
    >
      <div className='not-prose flex justify-center'>
        <a
          href='https://github.com/Yeolar/rememoi'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-x-3 rounded-full border bg-background px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md'
        >
          <span className='size-2 rounded-full bg-green-400' />
          <p className='font-medium text-muted-foreground'><Trans en='Open source on GitHub' zh='在 GitHub 开源' /></p>
        </a>
      </div>
      <p>
        This page collects the projects I maintain, the tools I learn from and the places I can be
        found. If you think it would be interesting to collaborate, get in touch.
      </p>

      <h2 id='programs'>Programs</h2>
      <ProjectSection projects={programs} />

      <h2 id='learnings'>Learnings</h2>
      <ProjectSection projects={learnings} />

      <h2 id='others'>Others</h2>
      <ProjectSection projects={others} />

      <h2 id='stack'>Stack</h2>
      <p>The site is deliberately small and portable:</p>
      <ul>
        <li>
          <strong>Framework:</strong> Next.js App Router with React server components
        </li>
        <li>
          <strong>Content:</strong> Markdown/MDX in libSQL (SQLite locally, Turso in production)
        </li>
        <li>
          <strong>Editing:</strong> a password/GitHub-protected admin area with draft previews
        </li>
        <li>
          <strong>Styling:</strong> Tailwind CSS v4, design tokens ported from Astro Theme Pure
        </li>
        <li>
          <strong>Highlighting:</strong> Shiki with the GitHub light/dark themes
        </li>
        <li>
          <strong>Comments:</strong> Waline (optional)
        </li>
      </ul>
    </ContentLayout>
  )
}
