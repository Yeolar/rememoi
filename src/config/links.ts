import siteConfig from '@/config/site'
import type { FriendListData, TimelineEvent } from '@/types'

export const friendLists: FriendListData[] = [
  {
    id_name: 'common-links',
    desc: 'Sites and tools I keep coming back to.',
    link_list: [
      {
        name: 'Astro',
        intro: 'The web framework for content-driven websites',
        link: 'https://astro.build/',
        avatar: 'https://github.com/withastro.png?size=160'
      },
      {
        name: 'Next.js',
        intro: 'The React framework for the web',
        link: 'https://nextjs.org/',
        avatar: 'https://github.com/vercel.png?size=160'
      },
      {
        name: 'Astro Theme Pure',
        intro: 'The clean blog theme this site is based on',
        link: 'https://astro-pure.js.org/',
        avatar: 'https://github.com/cworld1.png?size=160'
      },
      {
        name: 'Waline',
        intro: 'A simple, safe comment system',
        link: 'https://waline.js.org/',
        avatar: 'https://github.com/walinejs.png?size=160'
      },
      {
        name: 'Shiki',
        intro: 'A beautiful syntax highlighter',
        link: 'https://shiki.style/',
        avatar: 'https://github.com/shikijs.png?size=160'
      },
      {
        name: 'Tailwind CSS',
        intro: 'A utility-first CSS framework',
        link: 'https://tailwindcss.com/',
        avatar: 'https://github.com/tailwindlabs.png?size=160'
      }
    ]
  },
  {
    id_name: 'special-links',
    desc: 'Places where I exist on the internet.',
    link_list: [
      {
        name: 'Yeolar on GitHub',
        intro: 'Code, experiments and this site',
        link: 'https://github.com/Yeolar',
        avatar: 'https://github.com/Yeolar.png?size=160'
      },
      {
        name: 'Rememoi repository',
        intro: 'The source code of this website',
        link: 'https://github.com/Yeolar/rememoi',
        avatar: 'https://github.com/Yeolar.png?size=160'
      }
    ]
  }
]

export const linkLogbook: TimelineEvent[] = [
  { date: '2026-11-07', content: 'Rebuilt the blog with Next.js and added an admin editor.' },
  { date: '2026-10-28', content: 'Wrote the first post: <em>Hello, Rememoi</em>.' },
  { date: '2026-10-20', content: 'Picked the Astro Theme Pure design as the visual foundation.' }
]

export const applyTip = [
  { name: 'Name', val: siteConfig.title },
  { name: 'Desc', val: siteConfig.description },
  { name: 'Link', val: siteConfig.url },
  { name: 'Avatar', val: `${siteConfig.url}/images/avatar.png` }
]
