import type { IconsType } from '@/components/icons/icons'

export type NavItem = {
  title: string
  link: string
}

export type FooterLink = {
  title: string
  link: string
  /** Uno/Tailwind classes, kept for parity with the original theme config. */
  style?: string
  /** 1: rendered before the copyright, 2: appended to the copyright line */
  pos?: 1 | 2
}

export type SocialLink = {
  icon: IconsType
  label: string
  href: string
}

export type SiteConfig = {
  title: string
  author: string
  description: string
  url: string
  titleDelimiter: string
  locale: {
    lang: string
    attrs: string
    dateLocale: string
    dateOptions: Intl.DateTimeFormatOptions
  }
  favicon: string
  socialCard: string
  logo: {
    src: string
    alt: string
    width: number
    height: number
  }
  header: {
    menu: NavItem[]
  }
  footer: {
    year: string
    links: FooterLink[]
    credits: boolean
    social: SocialLink[]
  }
  content: {
    blogPageSize: number
    externalLinks: {
      content: string
    }
    share: Array<'weibo' | 'x' | 'bluesky'>
  }
  integrations: {
    quote: {
      server: string
      fallback: string[]
    }
    mediumZoom: {
      enable: boolean
      selector: string
    }
    waline: {
      enable: boolean
      server: string
      showMeta: boolean
      emoji: string[]
      locale?: Record<string, string>
    }
  }
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
)

const walineServer = process.env.NEXT_PUBLIC_WALINE_SERVER || ''

export const siteConfig: SiteConfig = {
  // [Basic]
  title: 'Rememoi',
  author: 'Yeolar',
  description: '把值得记住的，留在这里。',
  url: siteUrl,
  titleDelimiter: '•',
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'en-US',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  favicon: '/favicon.ico',
  socialCard: '/images/social-card.jpg',
  logo: {
    src: '/images/avatar.png',
    alt: 'Rememoi avatar',
    width: 256,
    height: 256
  },

  // [Header]
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      { title: 'Archive', link: '/archives' },
      { title: 'Projects', link: '/projects' },
      { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ]
  },

  // [Footer]
  footer: {
    year: `© ${new Date().getFullYear()}`,
    links: [{ title: 'Site Policy', link: '/terms', pos: 2 }],
    credits: true,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/Yeolar/rememoi' },
      { icon: 'rss', label: 'RSS', href: '/rss.xml' }
    ]
  },

  // [Content]
  content: {
    blogPageSize: 6,
    externalLinks: {
      content: ' ↗'
    },
    share: ['weibo', 'x', 'bluesky']
  },

  // [Integrations]
  integrations: {
    quote: {
      server: 'https://dummyjson.com/quotes/random',
      fallback: [
        'Stay hungry, stay foolish.',
        'Remember, remember, the days we keep.',
        'The best way to predict the future is to invent it.',
        'Simplicity is the ultimate sophistication.',
        'What we remember becomes who we are.'
      ]
    },
    mediumZoom: {
      enable: true,
      selector: '.prose .zoomable'
    },
    waline: {
      enable: walineServer.length > 0,
      server: walineServer,
      showMeta: false,
      emoji: ['bmoji', 'weibo'],
      locale: {
        nick: 'Name',
        mail: 'Email',
        login: 'Login (Optional)',
        placeholder: 'Comment here... (Email to receive replies)',
        reaction0: 'Like'
      }
    }
  }
}

export default siteConfig
