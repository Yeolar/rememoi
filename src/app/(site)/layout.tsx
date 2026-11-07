import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id='main-container'
      className='flex min-h-[100dvh] w-full max-w-[70rem] flex-col justify-between'
    >
      <Header />
      <div className='w-full flex-1'>{children}</div>
      <Footer />
    </div>
  )
}
