import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostArticle } from '@/components/blog/PostArticle'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { getAdjacentPosts, getPostBySlug, getVisiblePosts } from '@/lib/posts'

type PostPageProps = {
  params: Promise<{ slug: string[] }>
}

function toSlug(parts: string[]) {
  return parts.map((part) => decodeURIComponent(part)).join('/')
}

export async function generateStaticParams() {
  const posts = await getVisiblePosts()
  return posts.map((post) => ({ slug: post.slug.split('/') }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(toSlug(slug))
  if (!post) return buildMetadata({ title: 'Post not found', path: '/blog' })

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    ogImage: post.heroImage?.src ?? siteConfig.socialCard,
    article: {
      publishedTime: post.publishDateISO,
      modifiedTime: post.updatedDateISO,
      authors: [siteConfig.author],
      tags: post.tags
    }
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(toSlug(slug))
  if (!post) notFound()
  if (process.env.NODE_ENV === 'production' && post.draft) notFound()

  const { prev, next } = await getAdjacentPosts(post.slug)

  return <PostArticle post={post} prev={prev} next={next} />
}
