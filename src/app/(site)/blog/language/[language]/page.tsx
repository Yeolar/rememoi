import { notFound } from 'next/navigation'

import { LanguagePostList } from '@/components/blog/LanguagePostList'
import siteConfig from '@/config/site'
import { getLanguageLabel, normalizeLanguage } from '@/lib/languages'
import { buildMetadata } from '@/lib/metadata'
import { safeDecode } from '@/lib/pagination'
import { getAllLanguages, getPostsByLanguage, getVisiblePosts, paginate } from '@/lib/posts'

type LanguagePageProps = {
  params: Promise<{ language: string }>
}

export async function generateStaticParams() {
  const languages = getAllLanguages(await getVisiblePosts())
  return languages.map(([language]) => ({ language }))
}

export async function generateMetadata({ params }: LanguagePageProps) {
  const { language } = await params
  const code = normalizeLanguage(safeDecode(language))
  if (!code) return buildMetadata({ title: 'Language', path: '/blog' })
  const label = getLanguageLabel(code)
  return buildMetadata({
    title: `Language: ${label}`,
    description: `All Rememoi posts written in ${label}.`,
    path: `/blog/language/${encodeURIComponent(code)}`,
    contentLanguage: code
  })
}

export default async function LanguagePage({ params }: LanguagePageProps) {
  const { language } = await params
  const code = normalizeLanguage(safeDecode(language))
  if (!code) notFound()

  const posts = await getPostsByLanguage(code)
  if (posts.length === 0) notFound()

  const pagination = paginate(posts, 1, siteConfig.content.blogPageSize)

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
