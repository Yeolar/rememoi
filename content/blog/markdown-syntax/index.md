---
title: 'Markdown Syntax Support'
description: 'A kitchen-sink tour of the markdown and MDX features supported by this blog.'
publishDate: 2026-09-14
updatedDate: 2026-09-20
tags:
  - markdown
  - reference
language: 'en'
heroImage: { src: './cover.jpg', color: '#B4C6DA', width: 1600, height: 1000, alt: 'Pale blue abstract cover' }
---

Markdown is a lightweight and easy-to-use syntax for styling your writing. This page is both a reference and a test page: everything below should render correctly in the blog.

## Basic syntax

### Headings

Use one to six hashes for headings. The table of contents on the right is generated from them automatically, including nested levels.

#### A slightly smaller heading

##### And a smaller one still

### Emphasis

_Italic text_ and **bold text**, together will be **_bold italic text_**. You can also use ~~strikethrough~~ and `inline code`.

### Links

A [link to somewhere](https://example.com) opens in a new tab when it points outside the site. Bare URLs become links too: https://astro-pure.js.org

### Blockquotes

> A good sentence is a small architecture.
>
> It has a doorway, a window, and just enough room to move.

## Lists

### Unordered

- The first item
- The second item
  - A nested item
  - Another nested item
- The third item

### Ordered

1. Write it down.
2. Read it aloud.
3. Cut the sentence that only exists to impress.
4. Publish.

### Task list

- [x] Set up the design tokens
- [x] Write the content pipeline
- [ ] Add a proper sitemap for images
- [ ] Stop rewriting the introduction

## Tables

| Feature | Supported | Notes |
| --- | :--: | --- |
| GFM tables | Yes | Aligned columns, header styling |
| Task lists | Yes | Via `remark-gfm` |
| Footnotes | Yes | See below |
| Math | Yes | KaTeX inline and block |
| Code highlighting | Yes | Shiki, dual themes |
| MDX components | Yes | In `.mdx` posts |

## Footnotes

Markdown footnotes are surprisingly useful for small asides[^1] that would interrupt the flow of a paragraph.

[^1]: Like this one. It renders at the bottom of the article with a link back to the reference.

## Code

```js
const posts = await getVisiblePosts()
const latest = posts.slice(0, 5)

return latest.map((post) => ({
  title: post.title,
  url: `/blog/${post.slug}`,
  minutes: post.minutesRead
}))
```

```ts title="src/lib/posts.ts"
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  await ensureSchema()
  const [row] = await getDb().select().from(posts).where(eq(posts.slug, slug)).limit(1)
  return row ? rowToPost(row) : undefined
}
```

```bash
pnpm install
pnpm db:setup
pnpm dev
```

```json
{
  "name": "rememoi",
  "private": true,
  "scripts": {
    "dev": "pnpm db:setup && next dev",
    "build": "pnpm db:setup && next build"
  }
}
```

A longer block collapses automatically once it passes fifteen lines, keeping very long snippets from taking over the page:

```ts title="scripts/very-long-example.ts"
type ImageMeta = {
  width: number
  height: number
  color?: string
}

interface PostInput {
  title: string
  slug: string
  description: string
  body: string
  tags: string[]
  heroImage?: ImageMeta
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)))
}

function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  return `${Math.max(1, Math.ceil(words / 200))} min`
}

export function summarize(input: PostInput) {
  return {
    ...input,
    tags: normalizeTags(input.tags),
    minutesRead: readingTime(input.body)
  }
}
```

## Images

![A generated abstract illustration](./figure.jpg)

Images are lazy-loaded, get rounded corners from the prose styles, and can be opened in a zoomable lightbox.

## Math

Inline math works: $E = mc^2$, and so does a display equation:

$$
\int_{0}^{1} x^{2}\,\mathrm{d}x = \frac{1}{3}
$$

A slightly more useful example from information theory:

$$
H(X) = -\sum_{i=1}^{n} p(x_i)\log_2 p(x_i)
$$

## Horizontal rules

---

That is the full set. If something looks wrong, it is probably a bug worth fixing.
