
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from '@shikijs/transformers'
import type { Element, ElementContent, Root } from 'hast'
import { h } from 'hastscript'
import { codeToHast, createHighlighter, type Highlighter, type ShikiTransformer } from 'shiki'
import { visit } from 'unist-util-visit'

/**
 * Shiki setup ported from Astro Theme Pure.
 * Code blocks render as `.astro-code` with title chips, language labels, copy
 * buttons and a collapse control for long snippets.
 */

const THEMES = {
  light: 'github-light',
  dark: 'github-dark'
} as const

const LANGUAGES = [
  'astro',
  'bash',
  'css',
  'diff',
  'go',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'jsx',
  'markdown',
  'mdx',
  'python',
  'ruby',
  'rust',
  'shell',
  'sql',
  'svelte',
  'text',
  'toml',
  'tsx',
  'typescript',
  'vue',
  'yaml'
] as const

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: [...LANGUAGES]
    })
  }
  return highlighterPromise
}

function parseMetaString(str = '') {
  return Object.fromEntries(
    str.split(' ').reduce(
      (acc: [string, string | true][], cur) => {
        const matched = cur.match(/(.+)?=("(.+)"|'(.+)')$/)
        if (matched === null) return acc
        acc.push([matched[1], matched[3] || matched[4] || true])
        return acc
      },
      [] as [string, string | true][]
    )
  )
}

function classNames(value: unknown) {
  if (Array.isArray(value)) return value.join(' ')
  if (typeof value === 'string') return value
  return ''
}

/** Nest a <pre> in the outer container and turn the container into a div. */
const updateStyle = (): ShikiTransformer => ({
  name: 'pure:update-style',
  pre(node) {
    const container = h('pre', node.children as ElementContent[])
    node.children = [container]
    node.tagName = 'div'
    node.properties = {
      ...node.properties,
      class: `${classNames(node.properties?.class)} astro-code`.trim()
    }
  }
})

/** Support ```ts title="file.ts" */
const addTitle = (): ShikiTransformer => ({
  name: 'pure:add-title',
  pre(node) {
    const rawMeta = this.options.meta?.__raw
    if (!rawMeta) return
    const meta = parseMetaString(rawMeta)
    if (!meta.title) return
    node.children.unshift(
      h(
        'div',
        { class: 'title text-sm text-muted-foreground px-3 py-1 rounded-lg border' },
        String(meta.title)
      )
    )
  }
})

const addLanguage = (): ShikiTransformer => ({
  name: 'pure:add-language',
  pre(node) {
    node.children.push(
      h(
        'span',
        { class: 'language ps-1 pe-3 text-sm bg-muted text-muted-foreground' },
        this.options.lang
      )
    )
  }
})

const copyIcon = (id: string) =>
  h('svg', { class: 'size-5' }, [h('use', { href: `/icons/code.svg#${id}` })])

const addCopyButton = (timeout = 2000): ShikiTransformer => ({
  name: 'pure:add-copy-button',
  pre(node) {
    node.children.push(
      h(
        'button',
        {
          type: 'button',
          class: 'copy text-muted-foreground p-1 box-content border rounded-lg bg-card',
          'aria-label': 'Copy code',
          'data-code': this.source,
          'data-timeout': String(timeout)
        },
        [
          h('div', { class: 'ready' }, [copyIcon('mingcute-clipboard-line')]),
          h('div', { class: 'success hidden' }, [copyIcon('mingcute-file-check-line')])
        ]
      )
    )
  }
})

const addCollapse = (displayLineCount = 15): ShikiTransformer => ({
  name: 'pure:add-collapse',
  pre(node) {
    const lineCount = this.lines?.length ?? this.source.split('\n').length
    if (lineCount <= displayLineCount) return
    node.properties = {
      ...node.properties,
      class: `${classNames(node.properties?.class)} collapsed`.trim()
    }
    node.children.push(
      h(
        'button',
        {
          type: 'button',
          class: 'collapse-toggle bg-card text-muted-foreground rounded-lg m-2',
          'aria-label': 'Toggle collapse code block'
        },
        [
          h('svg', { class: 'size-5' }, [
            h('use', { href: '/icons/code.svg#mingcute-arrow-down-line' })
          ]),
          h('span', { class: 'desc' }, ' code')
        ]
      ),
      h('div', { class: 'collapse-fade' })
    )
  }
})

function getText(node: Element): string {
  return node.children
    .map((child) => {
      if (child.type === 'text') return child.value
      if (child.type === 'element') return getText(child)
      return ''
    })
    .join('')
}

type CodeTask = {
  parent: Root | Element
  index: number
  parentChildren: ElementContent[]
  source: string
  language: string
  meta: string
}

export type RehypeShikiOptions = {
  /** Max lines before a code block is collapsed. */
  collapseAfter?: number
}

export default function rehypeShiki(options: RehypeShikiOptions = {}) {
  const collapseAfter = options.collapseAfter ?? 15

  return async (tree: Root) => {
    const highlighter = await getHighlighter()
    const tasks: CodeTask[] = []

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || index === undefined || !parent) return
      const code = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code'
      )
      if (!code) return

      const classes = classNames(code.properties?.className).split(/\s+/)
      const languageClass = classes.find((name) => name.startsWith('language-'))
      const requested = languageClass?.replace('language-', '') ?? 'text'
      const language = highlighter.getLoadedLanguages().includes(requested) ? requested : 'text'
      const meta = String(node.properties?.['data-meta'] ?? code.properties?.['data-meta'] ?? '')

      tasks.push({
        parent: parent as Root | Element,
        index,
        parentChildren: parent.children as ElementContent[],
        source: getText(code).replace(/\n$/, ''),
        language,
        meta
      })
    })

    for (const task of tasks) {
      const highlighted = await codeToHast(task.source, {
        lang: task.language,
        themes: THEMES,
        meta: { __raw: task.meta },
        transformers: [
          transformerNotationDiff(),
          transformerNotationHighlight(),
          transformerRemoveNotationEscape(),
          updateStyle(),
          addTitle(),
          addLanguage(),
          addCopyButton(2000),
          addCollapse(collapseAfter)
        ]
      })
      const first = highlighted.children[0]
      if (first?.type === 'element') {
        task.parentChildren[task.index] = first
      }
    }
  }
}
