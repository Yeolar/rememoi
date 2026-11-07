import { Toc } from '@/components/content/Toc'
import { Trans } from '@/components/i18n/Trans'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { ProjectSection } from '@/components/projects/ProjectSection'
import { buildMetadata } from '@/lib/metadata'
import type { Heading, Project } from '@/types'

export const metadata = buildMetadata({
  title: 'Projects',
  description: "The small stack behind Rememoi's memory.",
  path: '/projects'
})

const headings: Heading[] = [
  { depth: 2, slug: 'programs', text: 'Programs' },
  { depth: 2, slug: 'learnings', text: 'Learnings' },
  { depth: 2, slug: 'others', text: 'Others' },
  { depth: 2, slug: 'stack', text: 'Stack' }
]

const headingLabels = {
  programs: { en: 'Archive & editor', zh: '记忆库与编辑器' },
  learnings: { en: 'Foundation', zh: '基础设施' },
  others: { en: 'Elsewhere', zh: '其他入口' },
  stack: { en: 'Stack', zh: '技术栈' }
}

const programs: Project[] = [
  {
    name: '📔 Rememoi',
    description: 'A long-term memory surface for agent conversations, with a small self-hosted editor.',
    descriptionZh: '面向 Agent 会话的长期记忆库，配有轻量的自托管编辑器。',
    links: [
      { type: 'github', href: 'https://github.com/Yeolar/rememoi' },
      { type: 'site', href: '/' }
    ]
  },
  {
    name: '✍️ Rememoi Admin',
    nameZh: '✍️ Rememoi 管理后台',
    description: 'The editing surface: Markdown drafts, image uploads, publish controls and API access.',
    descriptionZh: '创作后台：Markdown 草稿、图片上传、发布控制和 API 访问。',
    links: [{ type: 'github', href: 'https://github.com/Yeolar/rememoi/tree/main/src/app/admin' }]
  }
]

const learnings: Project[] = [
  {
    name: '🎨 Astro Theme Pure',
    description: 'The clean Astro blog theme whose design language this site is built on.',
    descriptionZh: '简洁的 Astro 博客主题，本站的设计语言正建立在它之上。',
    links: [
      { type: 'github', href: 'https://github.com/cworld1/astro-theme-pure' },
      { type: 'site', href: 'https://astro-pure.js.org/' },
      { type: 'doc', href: 'https://astro-pure.js.org/docs/list' }
    ]
  },
  {
    name: '▲ Next.js',
    description: 'The App Router, server components and route handlers power this site.',
    descriptionZh: 'App Router、服务端组件和路由处理器为本站提供动力。',
    links: [
      { type: 'github', href: 'https://github.com/vercel/next.js' },
      { type: 'site', href: 'https://nextjs.org/' },
      { type: 'doc', href: 'https://nextjs.org/docs' }
    ]
  },
  {
    name: '🌈 Shiki',
    description: 'Beautiful syntax highlighting, with dual themes and line-level transformers.',
    descriptionZh: '优雅的语法高亮，支持明暗双主题和行级转换器。',
    links: [
      { type: 'github', href: 'https://github.com/shikijs/shiki' },
      { type: 'doc', href: 'https://shiki.style/' }
    ]
  }
]

const others: Project[] = [
  {
    name: 'Yeolar on GitHub',
    nameZh: 'Yeolar 的 GitHub',
    description: 'Code, experiments and the occasional unfinished idea.',
    descriptionZh: '代码、实验，以及偶尔尚未完成的想法。',
    links: [{ type: 'github', href: 'https://github.com/Yeolar' }]
  },
  {
    name: 'RSS feed',
    nameZh: 'RSS 订阅',
    description: 'Follow new posts without an account.',
    descriptionZh: '无需账号，即可订阅新文章。',
    links: [{ type: 'site', href: '/rss.xml' }]
  }
]

export default function ProjectsPage() {
  return (
    <ContentLayout
      backHref='/'
      sidebar={<Toc headings={headings} labels={headingLabels} />}
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
        <Trans
          en='The small, portable stack that keeps Rememoi memory durable and findable.'
          zh='支撑 Rememoi 记忆持久保存、方便重新找到的小型技术栈。'
        />
      </p>

      <h2 id='programs'><Trans en='Archive & editor' zh='记忆库与编辑器' /></h2>
      <ProjectSection projects={programs} />

      <h2 id='learnings'><Trans en='Foundation' zh='基础设施' /></h2>
      <ProjectSection projects={learnings} />

      <h2 id='others'><Trans en='Elsewhere' zh='其他入口' /></h2>
      <ProjectSection projects={others} />

      <h2 id='stack'><Trans en='Stack' zh='技术栈' /></h2>
      <p><Trans en='The site is deliberately small and portable:' zh='本站刻意保持小而便于迁移：' /></p>
      <ul>
        <li>
          <Trans en='Framework: ' zh='框架：' />
          <Trans en='Next.js App Router with React server components' zh='Next.js App Router 与 React 服务端组件' />
        </li>
        <li>
          <Trans en='Content: ' zh='内容：' />
          <Trans en='Markdown/MDX in libSQL (SQLite locally, Turso in production)' zh='libSQL 中的 Markdown/MDX（本地 SQLite，生产 Turso）' />
        </li>
        <li>
          <Trans en='Editing: ' zh='编辑：' />
          <Trans en='a password/GitHub-protected admin area with draft previews' zh='密码/GitHub 保护的管理后台，支持草稿预览' />
        </li>
        <li>
          <Trans en='Styling: ' zh='样式：' />
          <Trans en='Tailwind CSS v4, design tokens ported from Astro Theme Pure' zh='Tailwind CSS v4，设计 token 移植自 Astro Theme Pure' />
        </li>
        <li>
          <Trans en='Highlighting: ' zh='高亮：' />
          <Trans en='Shiki with the GitHub light/dark themes' zh='Shiki，使用 GitHub 明暗主题' />
        </li>
        <li>
          <Trans en='Comments: ' zh='评论：' />
          <Trans en='Waline (optional)' zh='Waline（可选）' />
        </li>
      </ul>
    </ContentLayout>
  )
}
