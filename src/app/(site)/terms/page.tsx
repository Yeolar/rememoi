import { Toc } from '@/components/content/Toc'
import { Trans } from '@/components/i18n/Trans'
import { ContentLayout } from '@/components/layout/ContentLayout'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import type { Heading } from '@/types'

export const metadata = buildMetadata({
  title: 'Site Policy',
  description: 'Privacy, copyright, disclaimer and terms for Rememoi.',
  path: '/terms'
})

const headings: Heading[] = [
  { depth: 2, slug: 'privacy-policy', text: 'Privacy Policy' },
  { depth: 2, slug: 'copyright', text: 'Copyright' },
  { depth: 2, slug: 'disclaimer', text: 'Disclaimer' },
  { depth: 2, slug: 'terms', text: 'Terms & Conditions' }
]

export default function TermsPage() {
  return (
    <ContentLayout
      backHref='/'
      sidebar={<Toc headings={headings} />}
      header={<h1 className='text-2xl font-medium sm:mb-2 sm:text-3xl'><Trans en='Site Policy' zh='站点政策' /></h1>}
    >
      <p>
        This page explains how {siteConfig.title} handles data, content and the small print. It is
        intentionally short and readable.
      </p>

      <h2 id='privacy-policy'>Privacy Policy</h2>
      <p>
        This site does not set advertising cookies or use third-party tracking pixels. The only
        persisted browser state is your theme and language preference, stored locally in your browser.
      </p>
      <p>
        If comments are enabled, the Waline comment service stores the name, email address and
        comment content you submit. Email addresses are used only to notify you about replies and
        are never sold or shared for marketing.
      </p>
      <p>
        Server logs may contain technical information such as IP addresses and user agents, kept
        only as long as needed for security and troubleshooting.
      </p>

      <h2 id='copyright'>Copyright</h2>
      <p>
        Unless stated otherwise, articles on this site are licensed under{' '}
        <a
          href='https://creativecommons.org/licenses/by-nc-sa/4.0/'
          target='_blank'
          rel='noopener noreferrer'
        >
          CC BY-NC-SA 4.0
        </a>
        . You may share and adapt the content for non-commercial purposes with attribution and under
        the same license.
      </p>
      <p>
        Code snippets are provided under the MIT license where applicable. The site design is
        inspired by{' '}
        <a href='https://github.com/cworld1/astro-theme-pure' target='_blank' rel='noopener noreferrer'>
          Astro Theme Pure
        </a>
        .
      </p>

      <h2 id='disclaimer'>Disclaimer</h2>
      <p>
        Opinions expressed here are my own and may change over time. Content is provided “as is”
        without warranty of any kind. I am not responsible for any loss or damage arising from the
        use of information on this site.
      </p>
      <p>
        External links are provided for convenience; I am not responsible for the content or
        privacy practices of third-party sites.
      </p>

      <h2 id='terms'>Terms &amp; Conditions</h2>
      <p>
        By using this site you agree to use it lawfully and respectfully. You may not attempt to
        disrupt the service, scrape it at a harmful rate, or misuse the comment system.
      </p>
      <p>
        These terms may be updated from time to time. Continued use of the site after changes means
        you accept the updated terms. Questions? Reach out via{' '}
        <a href='https://github.com/Yeolar' target='_blank' rel='noopener noreferrer'>
          GitHub
        </a>
        .
      </p>
    </ContentLayout>
  )
}
