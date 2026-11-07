import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 text-center'>
      <h1 className='block text-7xl font-bold sm:text-9xl'>404</h1>
      <p className='mt-3 text-muted-foreground'>Oops, something went wrong.</p>
      <p className='text-lg'>Sorry, we couldn&apos;t find your page.</p>
      <Button title='Back to home' href='/' variant='ahead' className='mt-5' />
    </div>
  )
}
