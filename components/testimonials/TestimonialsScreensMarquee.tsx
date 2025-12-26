'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

const screenshotTestimonials = [
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (1).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (2).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (3).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (4).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (1).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (2).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (3).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.31.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.32.jpeg'
]

export function TestimonialsScreensMarquee () {
  const scrollRef = useRef<HTMLDivElement>(null)
  const duplicated = [...screenshotTestimonials, ...screenshotTestimonials]

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let animationFrameId: number | null = null

    const timeoutId = setTimeout(() => {
      container.setAttribute('dir', 'ltr')
      const scrollAmount = 0.7

      function scroll () {
        if (container) {
          const firstCard = container.querySelector('[data-screen-card]') as HTMLElement
          if (!firstCard || firstCard.offsetWidth === 0) {
            animationFrameId = requestAnimationFrame(scroll)
            return
          }

          const cardWidth = firstCard.offsetWidth
          const gap = 24
          const singleSetWidth = screenshotTestimonials.length * (cardWidth + gap)

          container.scrollLeft = container.scrollLeft + scrollAmount

          if (container.scrollLeft >= singleSetWidth) {
            container.scrollLeft = container.scrollLeft - singleSetWidth
          }
        }
        animationFrameId = requestAnimationFrame(scroll)
      }

      animationFrameId = requestAnimationFrame(scroll)
    }, 120)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <section className='py-10 sm:py-14 lg:py-16 bg-gray-50'>
      <div className='px-3 sm:px-4 md:px-6 lg:px-8 mx-auto max-w-7xl'>
        <div className='max-w-2xl mx-auto text-center'>
          <p className='text-sm font-medium text-yellow-600'>
            دليل اجتماعي حقيقي
          </p>
          <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            شاهد <GradientText text='رسائل الامتنان' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' /> كما هي
          </h2>
          <p className='mt-3 text-sm leading-7 text-gray-600 sm:text-base'>
            شريط متحرك يعرض لقطات شاشة من رسائل حقيقية من متدرّبين أنهوا مساراتهم معنا.
          </p>
        </div>

        <div className='relative mt-6 sm:mt-8'>
          <div className='pointer-events-none absolute inset-y-4 left-0 w-6 sm:w-10 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent z-10' />
          <div className='pointer-events-none absolute inset-y-4 right-0 w-6 sm:w-10 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent z-10' />

          <div
            ref={scrollRef}
            className='relative flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-3'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              direction: 'ltr'
            }}
          >
            {duplicated.map((src, index) => (
              <div
                key={`${src}-${index}`}
                data-screen-card
                className='flex-shrink-0 w-60 sm:w-72'
              >
                <div className='relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm'>
                  <div className='relative h-64'>
                    <Image
                      src={src}
                      alt={`رسالة شكر ${index + 1}`}
                      fill
                      className='object-contain w-full h-full bg-gray-50'
                      sizes='18rem'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  )
}


