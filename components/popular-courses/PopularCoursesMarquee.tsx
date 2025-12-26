'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { courses } from './PopularCourses'

export function PopularCoursesMarquee () {
  const scrollRef = useRef<HTMLDivElement>(null)
  const duplicated = [...courses, ...courses]

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let animationFrameId: number | null = null

    const timeoutId = setTimeout(() => {
      container.setAttribute('dir', 'ltr')
      const scrollAmount = 0.6

      function scroll () {
        if (container) {
          const firstCard = container.querySelector('[data-course-card]') as HTMLElement
          if (!firstCard || firstCard.offsetWidth === 0) {
            animationFrameId = requestAnimationFrame(scroll)
            return
          }

          const cardWidth = firstCard.offsetWidth
          const gap = 24
          const singleSetWidth = courses.length * (cardWidth + gap)

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
            لا تعرف من أين تبدأ؟
          </p>
          <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            جرّب واحدة من <GradientText text='أشهر الدورات' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className='mt-3 text-sm leading-7 text-gray-600 sm:text-base'>
            تمرير تلقائي يعرض لك الدورات الأكثر شعبية، مع زر ذهبي واضح للبدء فوراً.
          </p>
        </div>

        <div className='relative mt-6 sm:mt-8'>
          <div className='pointer-events-none absolute inset-y-2 sm:inset-y-1 left-0 w-6 sm:w-10 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent z-10' />
          <div className='pointer-events-none absolute inset-y-2 sm:inset-y-1 right-0 w-6 sm:w-10 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent z-10' />

          <div
            ref={scrollRef}
            className='relative flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              direction: 'ltr'
            }}
          >
            {duplicated.map((course, index) => (
              <div
                key={`${course.id}-${index}`}
                data-course-card
                className='flex-shrink-0 w-72 sm:w-80'
              >
                <div className='relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300'>
                  <div className='relative h-36'>
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className='object-cover w-full h-full'
                      sizes='20rem'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/0' />
                    <div className='absolute bottom-3 right-4 left-4 text-right'>
                      <p className='text-sm font-semibold text-white line-clamp-1'>
                        {course.title}
                      </p>
                      <p className='mt-1 text-[11px] text-gray-200'>
                        {course.category} • {course.rating} ★ • {course.students.toLocaleString()} طالب
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between px-4 py-3 border-t border-gray-100'>
                    <span className='text-sm font-bold text-gray-900'>
                      {course.price.toLocaleString()} د.ج
                    </span>
                    <Link
                      href={`/courses/${course.id}`}
                      className='inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-amber-950 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_8px_20px_rgba(217,119,6,0.5)] hover:brightness-105 transition-all'
                    >
                      ابدأ الآن
                    </Link>
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


