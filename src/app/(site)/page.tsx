import { Highlight } from '@/components/site/Highlight'
import { PostPreview } from '@/components/content/PostPreview'
import { Quote } from '@/components/content/Quote'
import { ProjectCard } from '@/components/home/ProjectCard'
import { Section } from '@/components/home/Section'
import { SkillLayout } from '@/components/home/SkillLayout'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import siteConfig from '@/config/site'
import { buildMetadata } from '@/lib/metadata'
import { getVisiblePosts } from '@/lib/posts'

export const metadata = buildMetadata({
  title: 'Home',
  description: siteConfig.description,
  path: '/'
})

const MAX_POSTS = 10

const languages = ['TypeScript', 'JavaScript', 'Python', 'SQL']
const frontend = ['React', 'Next.js', 'Tailwind CSS', 'Astro']
const backend = ['Node.js', 'libSQL', 'Waline']

export default async function HomePage() {
  const posts = (await getVisiblePosts()).slice(0, MAX_POSTS)

  return (
    <>
      <Highlight color='#659EB9' />
      <main className='flex w-full flex-col items-center'>
        <section className='animate mb-10 flex flex-col items-center gap-y-7' id='content-header'>
          <img
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={siteConfig.logo.width}
            height={siteConfig.logo.height}
            loading='eager'
            className='h-28 w-auto rounded-full border p-1'
          />

          <div className='flex flex-col items-center gap-y-4'>
            <h1 className='text-3xl font-medium'>{siteConfig.author}</h1>
            <div className='flex flex-wrap justify-center gap-x-7 gap-y-3'>
              <Label title='Somewhere' icon={<Icon name='location' className='size-5' />} />
              <Label
                title='GitHub'
                href='https://github.com/Yeolar'
                target='_blank'
                icon={<Icon name='github' className='size-5' />}
              />
            </div>
          </div>

          <a
            href='https://github.com/Yeolar/rememoi'
            target='_blank'
            rel='noopener noreferrer'
            className='flex flex-row items-center gap-x-3 rounded-full border bg-background px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md'
          >
            <span className='relative flex items-center justify-center'>
              <span className='absolute size-2 animate-ping rounded-full border border-green-400 bg-green-400 opacity-75' />
              <span className='size-2 rounded-full bg-green-400' />
            </span>
            <p className='font-medium text-muted-foreground'>Building in public</p>
          </a>
        </section>

        <div id='content' className='animate flex w-full flex-col gap-y-10 md:w-4/5 lg:w-5/6'>
          <Section title='About'>
            <p className='text-muted-foreground'>
              Rememoi is a small place on the internet for the things worth remembering — notes on
              code, design, music and the slow process of making a life.
            </p>
            <p className='text-muted-foreground'>
              Built with Next.js, a self-hosted editor and a lot of care. The visual language comes
              from the lovely{' '}
              <a
                href='https://github.com/cworld1/astro-theme-pure'
                target='_blank'
                rel='noopener noreferrer'
              >
                Astro Theme Pure
              </a>
              .
            </p>
            <Button title='More about me' className='w-fit self-end' href='/about' variant='ahead' />
          </Section>

          {posts.length > 0 && (
            <Section title='Posts'>
              <ul className='flex flex-col gap-y-1.5 sm:gap-y-2'>
                {posts.map((post) => (
                  <PostPreview key={post.id} post={post} />
                ))}
              </ul>
              <Button title='More posts' className='w-fit self-end' href='/blog' variant='ahead' />
            </Section>
          )}

          <Section title='Focus'>
            <Card
              heading='A quiet, personal publishing space'
              subheading='Writing, editing and shipping on a small Next.js stack. No noise, no infinite feed — just a place to remember.'
              date='2026 — now'
            />
          </Section>

          <Section title='Website List'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <ProjectCard
                href='https://github.com/Yeolar/rememoi'
                heading='Rememoi'
                subheading='This blog, rebuilt with Next.js'
                imagePath='/images/projects/1.jpg'
              />
              <ProjectCard
                href='https://github.com/cworld1/astro-theme-pure'
                heading='Astro Theme Pure'
                subheading='The design foundation of this site'
                imagePath='/images/projects/2.jpg'
              />
              <ProjectCard
                href='https://nextjs.org/'
                heading='Next.js'
                subheading='The framework behind the site'
                imagePath='/images/projects/3.jpg'
              />
              <ProjectCard
                href='/projects'
                heading='More projects'
                subheading='Check out more things I have built'
                imagePath='/images/projects/4.jpg'
                external={false}
              />
            </div>
          </Section>

          <Section title='Skills'>
            <SkillLayout title='Languages' skills={languages} />
            <SkillLayout title='Frontend' skills={frontend} />
            <SkillLayout title='Backend' skills={backend} />
          </Section>
        </div>

        <Quote className='mt-12' />
      </main>
    </>
  )
}
