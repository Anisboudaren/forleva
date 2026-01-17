'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'
import { categories } from './Categories'

export function CategoriesMarquee () {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    
    const cardWidth = 288 // w-72 = 18rem = 288px
    const gap = 24 // gap-6 = 1.5rem = 24px
    const scrollAmount = cardWidth + gap
    
    // In RTL, positive scrollLeft scrolls to show earlier content (visually right)
    // Negative scrollLeft scrolls to show later content (visually left)
    if (direction === 'right') {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    } else {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

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
          {/* Navigation Buttons - Desktop Only */}
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="تمرير للخلف"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="تمرير للأمام"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div
            ref={scrollRef}
            className='relative flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2 w-full snap-x snap-mandatory scroll-smooth'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              direction: 'rtl',
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
                  <div className='relative h-52 sm:h-64'>
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className='object-cover w-full h-full'
                      sizes='18rem'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0' />
                    <div className='absolute bottom-0 right-0 left-0 p-5 sm:p-6 text-right'>
                      <p className='text-sm font-medium text-yellow-200 mb-2 sm:text-base'>
                        {category.category} • {category.courses}
                      </p>
                      <p className='text-2xl font-bold text-white sm:text-3xl lg:text-4xl'>
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
