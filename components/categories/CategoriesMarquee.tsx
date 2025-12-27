'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { categories } from './Categories'

export function CategoriesMarquee () {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Duplicate categories for seamless scrolling
  const duplicated = [...categories, ...categories]

  return (
    <section className='py-10 sm:py-14 lg:py-16 bg-gray-50 w-full overflow-hidden' dir="rtl">
      <div className='w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='max-w-2xl mx-auto text-center'>
          <p className='text-sm font-medium text-yellow-600'>
            مجالات تعلّم متجددة
          </p>
          <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            اكتشف <GradientText text='الفئات الأكثر طلباً' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className='mt-3 text-base leading-7 text-gray-600 sm:text-lg'>
            اختر من بين مجموعة واسعة من الفئات والدورات المتخصصة
          </p>
        </div>

        <div className='relative mt-6 sm:mt-8 w-full'>
          <div
            ref={scrollRef}
            className='relative flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2 w-full snap-x snap-mandatory scroll-smooth'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              direction: 'ltr',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {duplicated.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                data-category-card
                className='flex-shrink-0 w-64 sm:w-72 snap-start'
              >
                <div className='relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100'>
                  <div className='relative h-32 sm:h-36'>
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className='object-cover w-full h-full'
                      sizes='18rem'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/0' />
                    <div className='absolute bottom-0 right-0 left-0 p-4 text-right'>
                      <p className='text-sm font-medium text-yellow-200 mb-1 sm:text-base'>
                        {category.category} • {category.courses}
                      </p>
                      <p className='text-xl font-bold text-white sm:text-2xl'>
                        {category.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
