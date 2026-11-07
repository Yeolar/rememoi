import fs from 'node:fs'
import path from 'node:path'

import type { ComponentType, ImgHTMLAttributes, ReactNode } from 'react'

import { imageSize } from 'image-size'
import { MDXRemote } from 'next-mdx-remote/rsc'
import type { Image as MdastImage, Root } from 'mdast'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { Aside } from '@/components/mdx/Aside'
import { Collapse } from '@/components/mdx/Collapse'
import { Spoiler } from '@/components/mdx/Spoiler'
import { Steps } from '@/components/mdx/Steps'
import { TabItem, Tabs } from '@/components/mdx/Tabs'
import { Timeline } from '@/components/mdx/Timeline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/icons/Icon'
import { Label } from '@/components/ui/Label'
import { resolveMediaSrc } from '@/lib/media'
import rehypeShiki from '@/lib/rehype-shiki'
import { cn } from '@/lib/utils'
import type { Post } from '@/types'

type MdxComponents = Record<string, ComponentType<any>>

/** Support ```ts title="file.ts" metadata for the shiki renderer. */
function remarkCodeMeta() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      if (!node.meta) return
      node.data = {
        ...node.data,
        hProperties: {
          ...(node.data?.hProperties as Record<string, unknown> | undefined),
          'data-meta': node.meta
        }
      }
    })
  }
}

/** Rewrite relative image paths to the public memory-media folder. */
function remarkContentImages(options: { slug: string }) {
  return (tree: Root) => {
    visit(tree, 'image', (node: MdastImage) => {
      const src = resolveMediaSrc(node.url, options.slug)
      node.url = src
      if (!src.startsWith('/memory-media/')) return
      try {
        const filePath = path.join(process.cwd(), 'public', src)
        if (!fs.existsSync(filePath)) return
        const size = imageSize(fs.readFileSync(filePath))
        if (size.width && size.height) {
          node.data = {
            ...node.data,
            hProperties: {
              ...(node.data?.hProperties as Record<string, unknown> | undefined),
              width: size.width,
              height: size.height
            }
          }
        }
      } catch {
        // Dimensions are a progressive enhancement; never fail rendering for them.
      }
    })
  }
}

const mdxComponents: MdxComponents = {
  Aside,
  Collapse,
  Spoiler,
  Steps,
  Tabs,
  TabItem,
  Timeline,
  Button,
  Card,
  Icon,
  Label,
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      alt={props.alt ?? ''}
      loading='lazy'
      decoding='async'
      className={cn('zoomable', props.className)}
    />
  )
}

function baseRehypePlugins(_slug: string): any[] {
  return [
    [rehypeKatex, { throwOnError: false, strict: false }],
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'append',
        properties: { className: ['anchor'], ariaHidden: 'true', tabIndex: -1 },
        content: { type: 'text', value: '#' }
      }
    ],
    [
      rehypeExternalLinks,
      {
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
        protocols: ['http', 'https'],
        properties: { className: ['external'] }
      }
    ]
  ]
}

export async function MdxBody({ post }: { post: Post }): Promise<ReactNode> {
  return (
    <MDXRemote
      source={post.body}
      components={mdxComponents as never}
      options={{
        parseFrontmatter: false,
        mdxOptions: {
          format: post.format === 'mdx' ? 'mdx' : 'md',
          remarkPlugins: [
            remarkGfm,
            remarkMath,
            remarkCodeMeta,
            [remarkContentImages, { slug: post.slug }] as any
          ],
          rehypePlugins: [...baseRehypePlugins(post.slug), [rehypeShiki, { collapseAfter: 15 }]]
        }
      }}
    />
  )
}

/** Markdown → HTML used by RSS, where interactive MDX components are not available. */
export async function renderMarkdownToHtml(body: string, slug: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkContentImages, { slug })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex, { throwOnError: false, strict: false })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(body)
  return String(file)
}
