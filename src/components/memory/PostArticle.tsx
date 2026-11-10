import type { ReactNode } from 'react'

import { ArticleBottom } from '@/components/content/ArticleBottom'
import { Copyright } from '@/components/content/Copyright'
import { Trans } from '@/components/i18n/Trans'
import { DocumentLanguage } from '@/components/content/DocumentLanguage'
import { Hero } from '@/components/content/Hero'
import { MediumZoom } from '@/components/content/MediumZoom'
import { PageInfo } from '@/components/content/PageInfo'
import { Toc } from '@/components/content/Toc'
import { Waline } from '@/components/content/Waline'
import { LockMark } from '@/components/icons/LockMark'
import { PencilLineMark } from '@/components/icons/PencilLineMark'
import { PencilMark } from '@/components/icons/PencilMark'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { Button } from '@/components/ui/Button'
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
  canEdit?: boolean
  backHref?: string
  backTitle?: ReactNode
}

export function PostArticle({
  post,
  prev,
  next,
  preview = false,
  canEdit = false,
  backHref = '/memory',
  backTitle = <Trans en='Back' zh='返回' />
}: PostArticleProps) {
  const walineEnabled = siteConfig.integrations.waline.enable
  const showComments = !preview && !post.draft && post.comment && walineEnabled
  const privateMark = post.private ? (
    <span className='inline-flex items-center text-muted-foreground' title='Private'>
      <LockMark className='size-4' />
      <span className='sr-only'><Trans en='Private' zh='私有' /></span>
    </span>
  ) : undefined
  const backAside =
    post.private || canEdit ? (
      <>
        {canEdit && (
          <Button href={`/admin/posts/${post.id}`} className='gap-x-1.5'>
            <span className='relative inline-flex size-4 items-center justify-center'>
              <PencilMark className='size-4 transition-opacity group-hover:opacity-0' />
              <PencilLineMark className='absolute inset-0 size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100' />
            </span>
            <Trans en='Edit' zh='编辑' />
          </Button>
        )}
        {privateMark}
      </>
    ) : undefined

  return (
    <>
      <DocumentLanguage language={post.language} />
      <Highlight color={post.heroImage?.color} />
      <ContentLayout
        backHref={backHref}
        backTitle={backTitle}
        backAside={backAside}
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
            <Copyright post={post} url={absoluteUrl(`/memory/${post.slug}`)} />
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
