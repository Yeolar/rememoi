import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { FormattedDate } from '@/components/ui/FormattedDate'
import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import { getLanguageLabel } from '@/lib/languages'
import { cn } from '@/lib/utils'
import type { PostSummary } from '@/types'

type PostPreviewProps = {
  post: PostSummary
  detailed?: boolean
  className?: string
}

function PreviewArrow() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='preview-redirect my-1 shrink-0 stroke-muted-foreground transition-colors group-hover:stroke-primary'
    >
      <line
        x1='5'
        y1='12'
        x2='19'
        y2='12'
        className='translate-x-4 scale-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-x-100'
      />
      <polyline
        points='12 5 19 12 12 19'
        className='translate-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1'
      />
    </svg>
  )
}

export function PostPreview({ post, detailed = false, className }: PostPreviewProps) {
  const postDate = post.updatedDate ?? post.publishDate
  const hero = post.heroImage

  return (
    <li
      className={cn('post-preview', className)}
      style={
        detailed && hero?.color
          ? ({
              '--preview-highlight': `color-mix(in srgb, ${hero.color} 40%, hsl(var(--foreground)))`,
              '--preview-highlight-bg': `hsl(from ${hero.color} h s l / 20%)`
            } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          'preview-card group relative block w-full rounded-2xl border bg-background px-5 py-2.5 transition-colors ease-in-out hover:text-primary',
          detailed && 'max-sm:px-4 sm:py-5',
          detailed && hero && 'max-md:pt-24'
        )}
      >
        {detailed && hero && (
          <img
            alt={hero.alt || post.title}
            src={hero.src}
            width={hero.width}
            height={hero.height}
            loading='lazy'
            className='cover-image absolute end-0 top-0 z-0 h-2/3 w-full rounded-2xl object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-70 md:h-full md:w-3/5'
          />
        )}
        <div
          className={cn(
            'relative z-10 flex flex-col gap-1',
            !detailed && 'sm:flex-row sm:items-center'
          )}
        >
          {postDate && <FormattedDate className='min-w-[95px] text-xs' date={postDate} />}

          <div className='flex flex-grow justify-between'>
            <div className={cn(detailed && 'font-medium')}>
              {post.pin && <span className='me-1 text-primary'><Trans en='[Pin]' zh='[置顶]' /></span>}
              {post.draft && <span className='me-1 text-red-500'><Trans en='(Draft)' zh='(草稿)' /></span>}
              <Link
                href={`/blog/${post.slug}`}
                className='text-foreground after:absolute after:inset-0 after:z-0 group-hover:text-inherit'
              >
                {post.title}
              </Link>
            </div>
            <PreviewArrow />
          </div>
        </div>

        {detailed && (
          <>
            <p
              className={cn(
                'relative z-10 line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3',
                hero && 'sm:me-24'
              )}
            >
              {post.description}
            </p>
            <div className='relative z-10 flex items-center gap-2 py-2 text-sm italic leading-4 text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Icon name='time' className='size-4' />
                <Trans en={post.minutesRead} zh={post.minutesRead.replace(/\bmin\b/, '分钟')} />
              </span>
              {post.language && (
                <span className='flex items-center gap-1'>
                  <Icon name='earth' className='size-4' />
                  {getLanguageLabel(post.language)}
                </span>
              )}
            </div>
            {post.tags.length > 0 && (
              <ul className='tag-list relative z-20 mt-1 flex flex-wrap gap-2' aria-label='Tags'>
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Button
                      title={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      variant='pill'
                      className='relative z-20'
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </li>
  )
}
