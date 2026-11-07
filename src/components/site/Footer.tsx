import Link from 'next/link'

import { Icon } from '@/components/icons/Icon'
import siteConfig from '@/config/site'

export function Footer() {
  const footer = siteConfig.footer
  const linksPos1 = footer.links.filter((link) => link.pos === 1)
  const linksPos2 = footer.links.filter((link) => link.pos === 2)

  return (
    <footer className='mx-auto mb-5 mt-16 w-full'>
      <div className='border-t pt-5'>
        <div className='flex items-center gap-y-3 max-sm:flex-col sm:justify-between sm:gap-y-0'>
          <div className='flex items-center gap-x-4 gap-y-2 text-muted-foreground max-sm:flex-col'>
            {linksPos1.length > 0 && (
              <div>
                {linksPos1.map(({ title, link, style }, index) => (
                  <span key={link}>
                    <a href={link} target='_blank' rel='noopener noreferrer' className={style}>
                      {title}
                    </a>
                    {index < linksPos1.length - 1 && <span className='mx-1'>•</span>}
                  </span>
                ))}
              </div>
            )}

            <div>
              <span>{footer.year}</span> <span>{siteConfig.author}</span>
              {linksPos2.length > 0 && (
                <>
                  <span> & </span>
                  <span>
                    {linksPos2.map(({ title, link, style }) => (
                      <Link key={link} href={link} className={style}>
                        {title}
                      </Link>
                    ))}
                  </span>
                </>
              )}
            </div>

            {footer.credits && (
              <span>
                <a
                  href='https://nextjs.org/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-foreground underline hover:text-primary'
                >
                  Next.js
                </a>
                <span> & </span>
                <a
                  href='https://github.com/cworld1/astro-theme-pure'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-foreground underline hover:text-primary'
                >
                  Pure theme
                </a>
                <span> inspired</span>
              </span>
            )}
          </div>

          <div className='flex items-center gap-x-4'>
            {footer.social.map(({ label, href, icon }) => (
              <a key={label} href={href} rel='me' className='flex items-center hover:text-primary'>
                <span className='sr-only'>{label}</span>
                <Icon name={icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
