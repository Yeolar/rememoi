'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import type { PostImage } from '@/types'

type HeroImageProps = {
  image: PostImage
  alt: string
}

export function HeroImage({ image, alt }: HeroImageProps) {
  const blurRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = blurRef.current
    if (!image) return
    const viewportHeight = window.innerHeight
    const threshold1 = viewportHeight / 9
    const threshold2 = (viewportHeight * 2) / 9
    const threshold3 = (viewportHeight * 3) / 9

    const onScroll = () => {
      const distance = window.scrollY
      if (distance >= threshold3) image.style.opacity = '0.1'
      else if (distance >= threshold2) image.style.opacity = '0.2'
      else if (distance >= threshold1) image.style.opacity = '0.3'
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className='hero-image relative mb-6'>
      {image.width && image.height ? (
        <Image
          src={image.src}
          alt={image.alt || alt}
          width={image.width}
          height={image.height}
          preload
          sizes='(max-width: 768px) 100vw, 65ch'
          className='cover-image relative z-10 h-auto w-full max-w-[65ch] rounded-2xl object-contain'
        />
      ) : (
        <img
          src={image.src}
          alt={image.alt || alt}
          className='cover-image relative z-10 h-auto w-full max-w-[65ch] rounded-2xl object-contain'
        />
      )}
      <img
        ref={blurRef}
        src={image.src}
        alt=''
        aria-hidden='true'
        className='absolute end-0 top-4 z-0 mt-0 h-full max-w-[65ch] rounded-3xl opacity-40 transition-opacity duration-300'
        style={{ filter: 'blur(24px)' }}
      />
    </div>
  )
}
