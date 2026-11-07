import GithubSlugger from 'github-slugger'
import type { Heading as MdastHeading, Root } from 'mdast'
import { toString as mdastToString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { getReadingTime } from '@/lib/utils'
import type { Heading } from '@/types'

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath)

export function parseMarkdown(body: string): Root {
  return parser.parse(body) as Root
}

export function extractHeadings(tree: Root): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  visit(tree, 'heading', (node: MdastHeading) => {
    const text = mdastToString(node).replace(/#$/, '')
    if (!text) return
    headings.push({ depth: node.depth, slug: slugger.slug(text), text })
  })
  return headings
}

export function extractPlainText(tree: Root): string {
  return mdastToString(tree).replace(/\s+/g, ' ').trim()
}

export function derivePostContent(body: string) {
  const tree = parseMarkdown(body)
  const plainText = extractPlainText(tree)
  const readingTime = getReadingTime(plainText)
  return {
    headings: extractHeadings(tree),
    plainText,
    minutesRead: readingTime.text,
    words: readingTime.words
  }
}
