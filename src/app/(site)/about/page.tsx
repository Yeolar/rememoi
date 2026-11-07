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

const headingLabels = {
  hobbies: { en: 'Hobbies', zh: '爱好' },
  tools: { en: 'Tools', zh: '工具' },
  'social-networks': { en: 'Social Networks', zh: '社交网络' },
  gossips: { en: 'Gossips', zh: '闲话' },
  'about-blog': { en: 'About Blog', zh: '关于博客' },
  'say-hello': { en: 'Say Hello', zh: '打个招呼' }
}

const designTools = [
  {
    name: 'Figma',
    description: 'Interface design',
    descriptionZh: '界面设计',
    href: 'https://www.figma.com/',
    icon: '/tools/figma.svg'
  },
  {
    name: 'Photoshop',
    description: 'Picture editing',
    descriptionZh: '图片处理',
    href: 'https://www.adobe.com/products/photoshop',
    icon: '/tools/photoshop.svg'
  },
  {
    name: 'After Effects',
    description: 'Motion graphics',
    descriptionZh: '动态图形',
    href: 'https://www.adobe.com/products/aftereffects',
    icon: '/tools/aftereffects.svg'
  },
  {
    name: 'Notion',
    description: 'Notes and planning',
    descriptionZh: '笔记与规划',
    href: 'https://www.notion.so/',
    icon: '/tools/notion.svg'
  }
]

const developmentTools = [
  {
    name: 'VS Code',
    description: 'Editor',
    descriptionZh: '编辑器',
    href: 'https://code.visualstudio.com/',
    icon: '/tools/vscode.svg'
  },
  {
    name: 'Neovim',
    description: 'Editor',
    descriptionZh: '编辑器',
    href: 'https://neovim.io/',
    icon: '/tools/neovim.svg'
  },
  {
    name: 'Chrome',
    description: 'Browser',
    descriptionZh: '浏览器',
    href: 'https://www.google.com/chrome/',
    icon: '/tools/chrome.svg'
  },
  {
    name: 'Typora',
    description: 'Markdown editor',
    descriptionZh: 'Markdown 编辑器',
    href: 'https://typora.io/',
    icon: '/tools/typora.svg'
  }
]

const environmentTools = [
  {
    name: 'macOS',
    description: 'Daily driver',
    descriptionZh: '日常主力',
    href: 'https://www.apple.com/macos/',
    icon: '/tools/apple.svg'
  },
  {
    name: 'Ubuntu',
    description: 'Linux distribution',
    descriptionZh: 'Linux 发行版',
    href: 'https://ubuntu.com/',
    icon: '/tools/ubuntu.svg'
  },
  {
    name: 'Arch Linux',
    description: 'Linux distribution',
    descriptionZh: 'Linux 发行版',
    href: 'https://archlinux.org/',
    icon: '/tools/archlinux.svg'
  },
  {
    name: 'Windows 11',
    description: 'Sometimes',
    descriptionZh: '偶尔使用',
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
        sidebar={<Toc headings={headings} labels={headingLabels} />}
        header={
          <div>
            <h1 className='text-2xl font-medium sm:mb-2 sm:text-3xl'><Trans en='About' zh='关于' /></h1>
            {walineEnabled && <PageInfo className='italic' />}
          </div>
        }
        bottom={walineEnabled ? <Waline /> : undefined}
      >
        <p><Trans en='Developer / Designer' zh='开发者 / 设计师' /></p>
        <p>
          <Trans
            en={<>Hi, I&apos;m {siteConfig.author}. I build websites, tools and small experiments, and this is where I keep the notes worth keeping.</>}
            zh={<>嗨，我是 {siteConfig.author}。我构建网站、工具和一些小实验，这里保存值得留下的笔记。</>}
          />
        </p>
        <p>
          <Trans
            en={<>Rememoi is a quiet corner of the internet: no algorithm, no infinite feed, just a growing archive of things I want to remember. Motto: </>}
            zh={<>Rememoi 是互联网上一个安静的角落：没有算法，没有无尽的信息流，只有一个不断生长的存档，收藏我想记住的东西。座右铭：</>}
          />
          <Spoiler>
            <Trans en='make it simple, then make it kind.' zh='先让它简单，再让它温柔。' />
          </Spoiler>
        </p>
        <Button title={<Trans en='Say hello' zh='打个招呼' />} className='w-fit' href='/about#say-hello' variant='ahead' />

        <h2 id='hobbies'><Trans en='Hobbies' zh='爱好' /></h2>
        <ul>
          <li><Trans en='Writing and reading — fiction, essays and far too many tabs.' zh='写作与阅读——小说、随笔，以及开得过多的标签页。' /></li>
          <li><Trans en='Music: from ambient playlists to the occasional synth patch.' zh='音乐：从氛围歌单到偶尔的合成器音色。' /></li>
          <li><Trans en='Photography and long walks with a camera.' zh='摄影，以及带着相机长时间散步。' /></li>
          <li><Trans en='Building tiny tools to solve problems that may or may not exist.' zh='做一些小工具，解决也许并不存在的问题。' /></li>
        </ul>

        <h2 id='tools'><Trans en='Tools' zh='工具' /></h2>
        <p><Trans en='Some of the tools that make the work pleasant:' zh='一些让工作更愉快的工具：' /></p>
         <ToolSection className='mb-5' title={<Trans en='Design' zh='设计' />} tools={designTools} />
         <ToolSection className='mb-5' title={<Trans en='Development' zh='开发' />} tools={developmentTools} />
         <ToolSection className='mb-5' title={<Trans en='Environment' zh='环境' />} tools={environmentTools} />

        <h2 id='social-networks'><Trans en='Social Networks' zh='社交网络' /></h2>
        <p>
          <Trans en='The best way to reach me is on GitHub. I read everything, even if I am slow to reply.' zh='联系我最好的方式是在 GitHub。所有消息我都会看，即使回复得慢。' />
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

        <h2 id='gossips'><Trans en='Gossips' zh='闲话' /></h2>
        <Collapse title={<Trans en='A small confession' zh='一个小坦白' />}>
          <p>
            <Trans en='I have rewritten this blog more times than I have published posts. The current version finally feels like it can stay.' zh='我重写这个博客的次数，比发布文章的篇数还多。现在这一版，终于感觉可以留下来了。' />
          </p>
          <p>
            <Trans en='Also: the theme is lovely, but I still spend an unreasonable amount of time choosing between two shades of blue.' zh='另外：这个主题很美，但我仍然会花不合理的时间，在两款蓝色之间犹豫。' />
          </p>
        </Collapse>

        <h2 id='about-blog'><Trans en='About Blog' zh='关于博客' /></h2>
        <p><Trans en='Website history:' zh='网站历史：' /></p>
        <Timeline
          events={[
            {
              date: '2026-11-07',
              content:
                'Rebuilt the site with <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">Next.js</a>, Tailwind CSS and a small self-hosted admin area.',
              contentZh:
                '使用 <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">Next.js</a>、Tailwind CSS 和一个小型自托管后台重建了本站。'
            },
            {
              date: '2026-10-28',
              content:
                'Chose the <a href="https://github.com/cworld1/astro-theme-pure" target="_blank" rel="noopener noreferrer">Astro Theme Pure</a> design as the visual foundation.',
              contentZh:
                '选用 <a href="https://github.com/cworld1/astro-theme-pure" target="_blank" rel="noopener noreferrer">Astro Theme Pure</a> 的设计作为视觉基础。'
            },
            {
              date: '2026-10-20',
              content: 'Registered the Rememoi idea: remember the good parts, quietly.',
              contentZh: '注册了 Rememoi 这个名字：安静地记住那些好的部分。'
            }
          ]}
        />
        <p>
          <Trans en='The site is built with Next.js, Tailwind CSS, Shiki, libSQL and Waline. The design is inspired by Astro Theme Pure, a beautifully minimal theme by CWorld.' zh='本站使用 Next.js、Tailwind CSS、Shiki、libSQL 和 Waline 构建。设计灵感来自 CWorld 的 Astro Theme Pure，一个极简而优美的主题。' />
        </p>
        <ul>
          <li>
            <Trans en='Framework: ' zh='框架：' /><a href='https://nextjs.org/'>Next.js</a>
          </li>
          <li>
            <Trans en='Design: ' zh='设计：' /><a href='https://astro-pure.js.org/'>Astro Theme Pure</a>
          </li>
          <li>
            <Trans en='Syntax highlighting: ' zh='语法高亮：' /><a href='https://shiki.style/'>Shiki</a>
          </li>
          <li>
            <Trans en='Comments: ' zh='评论：' /><a href='https://waline.js.org/'>Waline</a>
          </li>
          <li>
            <Trans en='Database: ' zh='数据库：' /><a href='https://turso.tech/'>libSQL / Turso</a>
          </li>
        </ul>

        <h2 id='say-hello'><Trans en='Say Hello' zh='打个招呼' /></h2>
        <p>
          <Trans en='Want to say hi, share a book recommendation, or point out a typo? Open an issue on ' zh='想打个招呼、推荐一本书，或者指出一个错别字？可以在 ' />
          <a href='https://github.com/Yeolar/rememoi'>GitHub</a>
          <Trans en=' or leave a comment on any post when comments are enabled.' zh=' 提 issue，或在开启评论的文章下留言。' />
        </p>
        <p>
          <Spoiler>
            <Trans en='I also accept exceptionally good playlist recommendations.' zh='我也接受异常好听的车载歌单推荐。' />
          </Spoiler>
        </p>
      </ContentLayout>
    </>
  )
}
