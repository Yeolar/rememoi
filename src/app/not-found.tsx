import { Button } from '@/components/ui/Button'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: '404',
  description: 'Not found',
  path: '/404'
})

export default function NotFound() {
  return (
    <div className='px-4 py-10 text-center sm:px-6 lg:px-8'>
      <h1 className='block text-7xl font-bold sm:text-9xl'>404</h1>
      <p className='mt-3 text-muted-foreground'>Oops, something went wrong.</p>
      <p className='text-lg'>Sorry, we couldn&apos;t find your page.</p>
      <Button title='Back to home' href='/' variant='ahead' className='mt-5' />
    </div>
  )
}
