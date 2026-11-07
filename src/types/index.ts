export type PostImage = {
  src: string
  alt?: string
  width?: number
  height?: number
  color?: string
}

export type PostFrontmatter = {
  title: string
  description: string
  publishDate: string | Date
  updatedDate?: string | Date
  heroImage?: {
    src: string
    alt?: string
    width?: number
    height?: number
    color?: string
  }
  tags?: string[]
  language?: string
  draft?: boolean
  pin?: boolean
  comment?: boolean
}

export type Heading = {
  depth: number
  slug: string
  text: string
}

export type TocItem = Heading & {
  subheadings: TocItem[]
}

export type Post = {
  id: string
  /** URL slug, directory separators are preserved for nested content. */
  slug: string
  title: string
  description: string
  publishDate: Date
  updatedDate?: Date
  publishDateISO: string
  updatedDateISO?: string
  heroImage?: PostImage
  tags: string[]
  language?: string
  draft: boolean
  status: 'draft' | 'published'
  pin: boolean
  comment: boolean
  minutesRead: string
  words: number
  headings: Heading[]
  body: string
  /** Plain text extracted from the markdown body, used for search & RSS. */
  plainText: string
  format: 'md' | 'mdx'
  sourcePath: string
}

export type PostSummary = Omit<
  Post,
  'body' | 'headings' | 'sourcePath' | 'format' | 'plainText'
>

export type Friend = {
  avatar: string
  name: string
  intro: string
  link: string
}

export type FriendListData = {
  id_name: string
  desc: string
  link_list: Friend[]
}

export type ProjectLink = {
  type: 'github' | 'site' | 'doc' | 'release'
  href: string
}

export type Project = {
  name: string
  description: string
  image?: string
  links: ProjectLink[]
}

export type TimelineEvent = {
  date: string
  content: string
}

export type CardListItem = {
  title: string
  link: string
}

export type SearchDocument = {
  slug: string
  title: string
  description: string
  tags: string[]
  headings: string[]
  content: string
  publishDate: string
  updatedDate?: string
}

/** Serialisable post shape used by the admin API and editor. */
export type AdminPostDTO = {
  id: string
  slug: string
  title: string
  description: string
  body: string
  format: 'md' | 'mdx'
  status: 'draft' | 'published'
  pinned: boolean
  commentsEnabled: boolean
  language: string | null
  tags: string[]
  heroImage: PostImage | null
  publishDate: string
  updatedDate: string | null
  createdAt: string
  updatedAt: string
}

export type AdminPostSummary = Omit<AdminPostDTO, 'body' | 'heroImage'> & {
  heroImage: PostImage | null
}

export type AdminPostInput = {
  title: string
  slug: string
  description: string
  body: string
  format: 'md' | 'mdx'
  status: 'draft' | 'published'
  pinned: boolean
  commentsEnabled: boolean
  language: string | null
  tags: string[]
  heroImage: PostImage | null
  publishDate: string
  updatedDate: string | null
}

export type AdminSessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  login?: string | null
  provider?: string
}
