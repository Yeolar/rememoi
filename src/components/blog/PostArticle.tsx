import { ArticleBottom } from '@/components/content/ArticleBottom'
import { Copyright } from '@/components/content/Copyright'
import { DocumentLanguage } from '@/components/content/DocumentLanguage'
import { Hero } from '@/components/content/Hero'
import { MediumZoom } from '@/components/content/MediumZoom'
import { PageInfo } from '@/components/content/PageInfo'
import { Toc } from '@/components/content/Toc'
import { Waline } from '@/components/content/Waline'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { Highlight } from '@/components/site/Highlight'
import siteConfig from '@/config/site'
import { MdxBody } from '@/lib/markdown'
import { absoluteUrl } from '@/lib/utils'
import type { Post } from '@/types'

type PostArticleProps = {
  post: Post
  prev?: Post
  next?: Post
  preview?: boolean
  backHref?: string
  backTitle?: string
}

export function PostArticle({
  post,
  prev,
  next,
  preview = false,
  backHref = '/blog',
  backTitle = 'Back'
}: PostArticleProps) {
  const walineEnabled = siteConfig.integrations.waline.enable
  const showComments = !preview && !post.draft && post.comment && walineEnabled

  return (
    <>
      <DocumentLanguage language={post.language} />
      <Highlight color={post.heroImage?.color} />
      <ContentLayout
        backHref={backHref}
        backTitle={backTitle}
        lang={post.language}
        sidebar={post.headings.length > 0 ? <Toc headings={post.headings} /> : undefined}
        header={
          <Hero
            post={post}
            descriptionSlot={showComments ? <PageInfo comment className='mt-1' /> : undefined}
          />
        }
        bottom={
          <>
            <Copyright post={post} url={absoluteUrl(`/blog/${post.slug}`)} />
            <ArticleBottom prev={prev} next={next} className='mt-3 sm:mt-6' />
            {showComments && <Waline className='mt-3 sm:mt-6' />}
          </>
        }
      >
        <MdxBody post={post} />
      </ContentLayout>
      {siteConfig.integrations.mediumZoom.enable && <MediumZoom />}
    </>
  )
}
