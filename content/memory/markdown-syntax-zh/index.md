---
title: 'Markdown 语法支持'
description: 'Markdown 是一种轻量级的标记语言。这篇文章展示博客支持的常用语法。'
publishDate: 2026-09-12
updatedDate: 2026-09-18
tags:
  - markdown
  - 中文
language: 'zh-CN'
heroImage: { src: './cover.jpg', color: '#C3B2C8', width: 1600, height: 1000, alt: '淡紫色抽象封面' }
---

Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档，再转换成结构化的网页。这个页面用来验证中文排版与常用语法。

## 标题与强调

### 三级标题

使用 **粗体**、*斜体*、**_粗斜体_**、~~删除线~~ 和 `行内代码` 来强调文字。

### 链接

这是一个[站外链接](https://nextjs.org/)，它会自动在新标签页打开。

### 引用

> 写作是把模糊的想法，慢慢磨成一句可以被别人读懂的话。
>
> 好的排版不喧哗，它只是让阅读变得不费力。

## 列表

- 第一项
- 第二项
  - 嵌套项
  - 另一个嵌套项
- 第三项

1. 先写下想法。
2. 再读一遍。
3. 删掉多余的句子。
4. 发布。

- [x] 完成设计系统
- [x] 完成内容管线
- [ ] 补上图片站点地图
- [ ] 少改一点开头

## 表格

| 功能 | 支持 | 说明 |
| --- | :--: | --- |
| GFM 表格 | 是 | 支持对齐与表头样式 |
| 任务列表 | 是 | 由 `remark-gfm` 提供 |
| 数学公式 | 是 | KaTeX 行内与块级公式 |
| 代码高亮 | 是 | Shiki 双主题 |
| MDX 组件 | 是 | 仅 `.mdx` 文章 |

## 代码

```ts title="src/lib/posts.ts"
export async function getPostsByTag(tag: string) {
  const postsList = await getVisiblePosts()
  return postsList.filter((post) => post.tags.includes(tag.toLowerCase()))
}
```

```bash
pnpm dev
# http://localhost:3000
```

## 数学公式

行内公式：$a^2 + b^2 = c^2$。

块级公式：

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

## 图片

![生成的抽象插图](./figure.jpg)

图片会懒加载、带圆角，并支持点击放大。

## 分隔线

---

如果这段中文读起来舒服，说明字体回退、行高和段落间距都调对了。
