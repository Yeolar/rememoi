import { notFound } from 'next/navigation'

import { LanguagePostList } from '@/components/blog/LanguagePostList'
import siteConfig from '@/config/site'
import { getLanguageLabel, normalizeLanguage } from '@/lib/languages'
import { buildMetadata } from '@/lib/metadata'
import { safeDecode } from '@/lib/pagination'
import { getAllLanguages, getPostsByLanguage, getVisiblePosts, paginate } from '@/lib/posts'

type LanguagePageProps = {
  params: Promise<{ language: string; page: string }>
}

export async function generateStaticParams() {
  const posts = await getVisiblePosts()
  return getAllLanguages(posts).flatMap(([language]) => {
    const languagePosts = posts.filter((post) => normalizeLanguage(post.language) === language)
    const totalPages = Math.max(
      1,
      Math.ceil(languagePosts.length / siteConfig.content.blogPageSize)
    )
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
      language,
      page: String(index + 2)
    }))
  })
}

export async function generateMetadata({ params }: LanguagePageProps) {
  const { language, page } = await params
  const code = normalizeLanguage(safeDecode(language))
  if (!code) return buildMetadata({ title: 'Language', path: '/blog' })
  const label = getLanguageLabel(code)
  return buildMetadata({
    title: `Language: ${label} · Page ${page}`,
    description: `All Rememoi posts written in ${label}.`,
    path: `/blog/language/${encodeURIComponent(code)}/page/${page}`,
    contentLanguage: code
  })
}

export default async function LanguagePageN({ params }: LanguagePageProps) {
  const { language, page } = await params
  const code = normalizeLanguage(safeDecode(language))
  if (!code) notFound()

  const pageNumber = Number(page)
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound()

  const posts = await getPostsByLanguage(code)
  if (posts.length === 0) notFound()

  const pagination = paginate(posts, pageNumber, siteConfig.content.blogPageSize)
  if (pagination.currentPage !== pageNumber) notFound()

  return (
    <LanguagePostList
      language={code}
      posts={pagination.items}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
    />
  )
}
