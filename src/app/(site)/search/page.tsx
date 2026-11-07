import { Trans } from '@/components/i18n/Trans'
import { SearchClient } from '@/components/search/SearchClient'
import { Button } from '@/components/ui/Button'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Search',
  description: 'Search relative posts of the whole blog',
  path: '/search'
})

export default function SearchPage() {
  return (
    <>
      <Button title={<Trans en='Back' zh='返回' />} href='/blog' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 text-3xl font-medium'><Trans en='Search' zh='搜索' /></h1>
        </div>
        <div id='content' className='animate'>
          <p className='mb-4'><Trans en='Enter a search term or phrase to search the blog.' zh='输入关键词或短语，搜索站内文章。' /></p>
          <SearchClient />
        </div>
      </main>
    </>
  )
}
