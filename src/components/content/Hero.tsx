import type { ReactNode } from 'react'

import { HeroImage } from '@/components/content/HeroImage'
import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import { FormattedDate } from '@/components/ui/FormattedDate'
import { getLanguageLabel } from '@/lib/languages'
import type { Post } from '@/types'

type HeroProps = {
  post: Post
  descriptionSlot?: ReactNode
}

export function Hero({ post, descriptionSlot }: HeroProps) {
  const { heroImage, draft, publishDate, updatedDate, minutesRead, language, tags, title, description } =
    post

  return (
    <>
      {heroImage && <HeroImage image={heroImage} alt={title} />}

      {draft ? <span className='text-red-500'>(<Trans en='Draft' zh='草稿' />)</span> : null}

      <div className='article-info max-lg:mx-auto'>
        <div className='flex flex-wrap gap-x-4 gap-y-2 text-xs leading-6 text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Icon name='calendar' className='size-5' />
            <FormattedDate date={publishDate} dateTimeOptions={{ month: 'short' }} />
            {updatedDate && (
              <div className='flex items-center gap-1'>
                <span> / </span>
                <span>
                  <Trans en='Update' zh='更新于' /> <FormattedDate date={updatedDate} dateTimeOptions={{ month: 'short' }} />
                </span>
              </div>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <Icon name='time' className='size-5' />
            <Trans en={minutesRead} zh={minutesRead.replace(/\bmin\b/, '分钟')} />
          </div>
          {language && (
            <span className='flex items-center gap-1'>
              <Icon name='earth' className='size-5' />
              {getLanguageLabel(language)}
            </span>
          )}
          {tags.length > 0 && (
            <span className='flex flex-wrap items-center gap-1'>
              <Icon name='hashtag' className='size-5' />
              {tags.map((tag, index) => (
                <span key={tag} className='flex items-center gap-1'>
                  <a
                    aria-label={`View more blogs with the tag ${tag}`}
                    className='hover:underline hover:underline-offset-4'
                    data-pagefind-filter='tag'
                    href={`/tags/${encodeURIComponent(tag)}`}
                  >
                    {tag}
                  </a>
                  {index < tags.length - 1 && <span>/</span>}
                </span>
              ))}
            </span>
          )}
        </div>

        <h1 className='mt-4 text-2xl font-medium sm:mb-2 sm:mt-6 sm:text-3xl'>{title}</h1>

        <div className='mt-3 italic'>
          <blockquote className='text-sm text-muted-foreground'>
            <q>{description}</q>
          </blockquote>
          {descriptionSlot}
        </div>
      </div>

      <div className='mt-4 w-1/2 border-t max-md:mx-auto sm:mt-6 sm:w-1/3' />
    </>
  )
}
