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
      <Button title='Back' href='/blog' variant='back' />
      <main className='mt-6 lg:mt-10'>
        <div id='content-header' className='animate'>
          <h1 className='mb-6 text-3xl font-medium'>Search</h1>
        </div>
        <div id='content' className='animate'>
          <p className='mb-4'>Enter a search term or phrase to search the blog.</p>
          <SearchClient />
        </div>
      </main>
    </>
  )
}
