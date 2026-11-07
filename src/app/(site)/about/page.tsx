import { ToolSection } from '@/components/about/ToolSection'
import { PageInfo } from '@/components/content/PageInfo'
import { Waline } from '@/components/content/Waline'
import { Toc } from '@/components/content/Toc'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { Trans } from '@/components/i18n/Trans'
import { Collapse } from '@/components/mdx/Collapse'
import { Spoiler } from '@/components/mdx/Spoiler'
import { Timeline } from '@/components/mdx/Timeline'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import type { Heading } from '@/types'

export const metadata = buildMetadata({
  title: 'About',
  description: `About ${siteConfig.author} and the Rememoi blog.`,
  path: '/about'
})

const headings: Heading[] = [
  { depth: 2, slug: 'hobbies', text: 'Hobbies' },
  { depth: 2, slug: 'tools', text: 'Tools' },
  { depth: 2, slug: 'social-networks', text: 'Social Networks' },
  { depth: 2, slug: 'gossips', text: 'Gossips' },
  { depth: 2, slug: 'about-blog', text: 'About Blog' },
  { depth: 2, slug: 'say-hello', text: 'Say Hello' }
]

const designTools = [
  {
    name: 'Figma',
    description: 'Interface design',
    href: 'https://www.figma.com/',
    icon: '/tools/figma.svg'
  },
  {
    name: 'Photoshop',
    description: 'Picture editing',
    href: 'https://www.adobe.com/products/photoshop',
    icon: '/tools/photoshop.svg'
  },
  {
    name: 'After Effects',
    description: 'Motion graphics',
    href: 'https://www.adobe.com/products/aftereffects',
    icon: '/tools/aftereffects.svg'
  },
  {
    name: 'Notion',
    description: 'Notes and planning',
    href: 'https://www.notion.so/',
    icon: '/tools/notion.svg'
  }
]

const developmentTools = [
  {
    name: 'VS Code',
    description: 'Editor',
    href: 'https://code.visualstudio.com/',
    icon: '/tools/vscode.svg'
  },
  {
    name: 'Neovim',
    description: 'Editor',
    href: 'https://neovim.io/',
    icon: '/tools/neovim.svg'
  },
  {
    name: 'Chrome',
    description: 'Browser',
    href: 'https://www.google.com/chrome/',
    icon: '/tools/chrome.svg'
  },
  {
    name: 'Typora',
    description: 'Markdown editor',
    href: 'https://typora.io/',
    icon: '/tools/typora.svg'
  }
]

const environmentTools = [
  {
    name: 'macOS',
    description: 'Daily driver',
    href: 'https://www.apple.com/macos/',
    icon: '/tools/apple.svg'
  },
  {
    name: 'Ubuntu',
    description: 'Linux distribution',
    href: 'https://ubuntu.com/',
    icon: '/tools/ubuntu.svg'
  },
  {
    name: 'Arch Linux',
    description: 'Linux distribution',
    href: 'https://archlinux.org/',
    icon: '/tools/archlinux.svg'
  },
  {
    name: 'Windows 11',
    description: 'Sometimes',
    href: 'https://www.microsoft.com/windows/windows-11',
    icon: '/tools/windows11.svg'
  }
]

export default function AboutPage() {
  const walineEnabled = siteConfig.integrations.waline.enable

  return (
    <>
      <ContentLayout
        backHref='/'
        sidebar={<Toc headings={headings} />}
        header={
          <div>
            <h1 className='text-2xl font-medium sm:mb-2 sm:text-3xl'><Trans en='About' zh='关于' /></h1>
            {walineEnabled && <PageInfo className='italic' />}
          </div>
        }
        bottom={walineEnabled ? <Waline /> : undefined}
      >
        <p>Developer / Designer</p>
        <p>
          Hi, I&apos;m {siteConfig.author}. I build websites, tools and small experiments, and this
          is where I keep the notes worth keeping.
        </p>
        <p>
          Rememoi is a quiet corner of the internet: no algorithm, no infinite feed, just a growing
          archive of things I want to remember. Motto: <Spoiler>make it simple, then make it kind.</Spoiler>
        </p>
        <Button title={<Trans en='Say hello' zh='打个招呼' />} className='w-fit' href='/about#say-hello' variant='ahead' />

        <h2 id='hobbies'>Hobbies</h2>
        <ul>
          <li>Writing and reading — fiction, essays and far too many tabs.</li>
          <li>Music: from ambient playlists to the occasional synth patch.</li>
          <li>Photography and long walks with a camera.</li>
          <li>Building tiny tools to solve problems that may or may not exist.</li>
        </ul>

        <h2 id='tools'>Tools</h2>
        <p>Some of the tools that make the work pleasant:</p>
         <ToolSection className='mb-5' title='Design' tools={designTools} />
         <ToolSection className='mb-5' title='Development' tools={developmentTools} />
         <ToolSection className='mb-5' title='Environment' tools={environmentTools} />

        <h2 id='social-networks'>Social Networks</h2>
        <p>
          The best way to reach me is on GitHub. I read everything, even if I am slow to reply.
        </p>
        <div className='not-prose my-4 flex flex-wrap gap-3'>
          <Button href='https://github.com/Yeolar' target='_blank' variant='pill'>
            <Icon name='github' className='size-5' />
            GitHub
          </Button>
          <Button href='/rss.xml' variant='pill'>
            <Icon name='rss' className='size-5' />
            RSS
          </Button>
          <Button href='https://github.com/Yeolar/rememoi' target='_blank' variant='pill'>
            <Icon name='github-circle' className='size-5' />
            <Trans en="This site's source" zh='本站源码' />
          </Button>
        </div>

        <h2 id='gossips'>Gossips</h2>
        <Collapse title='A small confession'>
          <p>
            I have rewritten this blog more times than I have published posts. The current version
            finally feels like it can stay.
          </p>
          <p>
            Also: the theme is lovely, but I still spend an unreasonable amount of time choosing
            between two shades of blue.
          </p>
        </Collapse>

        <h2 id='about-blog'>About Blog</h2>
        <p>Website history:</p>
        <Timeline
          events={[
            {
              date: '2026-11-07',
              content:
                'Rebuilt the site with <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">Next.js</a>, Tailwind CSS and a small self-hosted admin area.'
            },
            {
              date: '2026-10-28',
              content:
                'Chose the <a href="https://github.com/cworld1/astro-theme-pure" target="_blank" rel="noopener noreferrer">Astro Theme Pure</a> design as the visual foundation.'
            },
            {
              date: '2026-10-20',
              content: 'Registered the Rememoi idea: remember the good parts, quietly.'
            }
          ]}
        />
        <p>
          The site is built with Next.js, Tailwind CSS, Shiki, libSQL and Waline. The design is
          inspired by Astro Theme Pure, a beautifully minimal theme by CWorld.
        </p>
        <ul>
          <li>
            Framework: <a href='https://nextjs.org/'>Next.js</a>
          </li>
          <li>
            Design: <a href='https://astro-pure.js.org/'>Astro Theme Pure</a>
          </li>
          <li>
            Syntax highlighting: <a href='https://shiki.style/'>Shiki</a>
          </li>
          <li>
            Comments: <a href='https://waline.js.org/'>Waline</a>
          </li>
          <li>
            Database: <a href='https://turso.tech/'>libSQL / Turso</a>
          </li>
        </ul>

        <h2 id='say-hello'>Say Hello</h2>
        <p>
          Want to say hi, share a book recommendation, or point out a typo? Open an issue on{' '}
          <a href='https://github.com/Yeolar/rememoi'>GitHub</a> or leave a comment on any post when
          comments are enabled.
        </p>
        <p>
          <Spoiler>I also accept exceptionally good playlist recommendations.</Spoiler>
        </p>
      </ContentLayout>
    </>
  )
}
