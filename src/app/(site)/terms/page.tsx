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

const headingLabels = {
  'privacy-policy': { en: 'Privacy Policy', zh: '隐私政策' },
  copyright: { en: 'Copyright', zh: '版权' },
  disclaimer: { en: 'Disclaimer', zh: '免责声明' },
  terms: { en: 'Terms & Conditions', zh: '条款与条件' }
}

export default function TermsPage() {
  return (
    <ContentLayout
      backHref='/'
      sidebar={<Toc headings={headings} labels={headingLabels} />}
      header={<h1 className='text-2xl font-medium sm:mb-2 sm:text-3xl'><Trans en='Site Policy' zh='站点政策' /></h1>}
    >
      <p>
        <Trans
          en={<>This page explains how {siteConfig.title} handles data, content and the small print. It is intentionally short and readable.</>}
          zh={<>本页说明 {siteConfig.title} 如何处理数据、内容与相关细则。力求简短易读。</>}
        />
      </p>

      <h2 id='privacy-policy'><Trans en='Privacy Policy' zh='隐私政策' /></h2>
      <p>
        <Trans
          en={
            <>
              When analytics is enabled, this site uses Google Analytics 4 to understand which pages are
              read. Google Analytics sets
              first-party cookies (<code>_ga</code>, <code>_ga_*</code>) and receives the page you visit,
              the referring page, an approximate location derived from your IP address, and device/browser
              details. Search terms and share-button clicks are reported as analytics events. The data is
              used only in aggregate to improve the site, never for advertising and never sold. You can
              block it with a content blocker, browser settings, or{' '}
              <a href='https://tools.google.com/dlpage/gaoptout' target='_blank' rel='noopener noreferrer'>
                Google&apos;s opt-out add-on
              </a>
              . Your theme and language preferences stay in this browser.
            </>
          }
          zh={
            <>
              启用统计时，本站使用 Google Analytics 4 了解哪些页面被阅读。Google Analytics 会设置第一方 Cookie（
              <code>_ga</code>、<code>_ga_*</code>），并接收你访问的页面、来源页面、由 IP
              推算的粗略位置以及设备/浏览器信息；搜索词和分享按钮点击也会作为事件上报。这些数据仅以汇总形式用于改进站点，不用于广告，也不会被出售。你可以通过内容拦截器、浏览器设置或{' '}
              <a href='https://tools.google.com/dlpage/gaoptout' target='_blank' rel='noopener noreferrer'>
                Google 的停用插件
              </a>
              阻止统计。主题和语言偏好仍然只保存在你的浏览器本地。
            </>
          }
        />
      </p>
      <p>
        <Trans
          en='If comments are enabled, the Waline comment service stores the name, email address and comment content you submit. Email addresses are used only to notify you about replies and are never sold or shared for marketing.'
          zh='如果启用了评论，Waline 评论服务会保存你提交的昵称、邮箱地址和评论内容。邮箱仅用于回复通知，绝不会被出售或用于营销。'
        />
      </p>
      <p>
        <Trans
          en='Server logs may contain technical information such as IP addresses and user agents, kept only as long as needed for security and troubleshooting.'
          zh='服务器日志可能包含 IP 地址、User-Agent 等技术信息，仅在安全与故障排查所需期间保留。'
        />
      </p>

      <h2 id='copyright'><Trans en='Copyright' zh='版权' /></h2>
      <p>
        <Trans
          en={<>Unless stated otherwise, articles on this site are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener noreferrer'>CC BY-NC-SA 4.0</a>. You may share and adapt the content for non-commercial purposes with attribution and under the same license.</>}
          zh={<>除另有说明外，本站文章采用 <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener noreferrer'>CC BY-NC-SA 4.0</a> 许可。你可以在署名且以相同方式共享的前提下，出于非商业目的分享和改编内容。</>}
        />
      </p>
      <p>
        <Trans
          en={<>Code snippets are provided under the MIT license where applicable. The site design is inspired by <a href='https://github.com/cworld1/astro-theme-pure' target='_blank' rel='noopener noreferrer'>Astro Theme Pure</a>.</>}
          zh={<>代码片段在适用情况下采用 MIT 许可。站点设计灵感来自 <a href='https://github.com/cworld1/astro-theme-pure' target='_blank' rel='noopener noreferrer'>Astro Theme Pure</a>。</>}
        />
      </p>

      <h2 id='disclaimer'><Trans en='Disclaimer' zh='免责声明' /></h2>
      <p>
        <Trans
          en='Rememoi is a living memory archive; entries may be written by agents or humans and may change over time. Content is provided “as is” without warranty of any kind. The maintainers are not responsible for any loss or damage arising from the use of information on this site.'
          zh='Rememoi 是一个持续生长的记忆档案；条目可能由 Agent 或人撰写，并可能随时间调整。内容按“现状”提供，不附带任何形式的保证。维护者不对因使用本站信息而产生的任何损失或损害负责。'
        />
      </p>
      <p>
        <Trans
          en='External links are provided for convenience; the maintainers are not responsible for the content or privacy practices of third-party sites.'
          zh='外部链接仅为方便访问而提供；维护者不对第三方网站的内容或隐私做法负责。'
        />
      </p>

      <h2 id='terms'><Trans en='Terms & Conditions' zh='条款与条件' /></h2>
      <p>
        <Trans
          en='By using this site you agree to use it lawfully and respectfully. You may not attempt to disrupt the service, scrape it at a harmful rate, or misuse the comment system.'
          zh='使用本站即表示你同意以合法、尊重的方式使用它。你不得尝试干扰服务、以有害频率抓取内容，或滥用评论系统。'
        />
      </p>
      <p>
        <Trans
          en='These terms may be updated from time to time. Continued use of the site after changes means you accept the updated terms. Questions? Reach out via '
          zh='这些条款可能不时更新。变更后继续使用本站，即表示你接受更新后的条款。如有疑问，请通过 '
        />
        <a href='https://github.com/Yeolar' target='_blank' rel='noopener noreferrer'>
          GitHub
        </a>
        <Trans en='.' zh=' 联系。' />
      </p>
    </ContentLayout>
  )
}
