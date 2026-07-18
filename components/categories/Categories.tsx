'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { PLACEHOLDER_COURSE_IMAGE } from '@/lib/safe-course-image'

export type PublicCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  courseCount: number
}

export function usePublicCategories() {
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PublicCategory[]) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading }
}

export function Categories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { categories, loading } = usePublicCategories()

  return (
    <section className='relative bg-gray-50'>
      <div className='relative z-10 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 lg:max-w-7xl lg:mx-auto lg:py-20 xl:py-28'>
        <div className='max-w-md mx-auto sm:max-w-lg lg:mx-0 lg:ml-auto'>
          <h2 className='text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl text-right'>
            استكشف{' '}
            <GradientText
              text='الفئات'
              gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
            />{' '}
            المتنوعة
          </h2>
          <p className='mt-2 sm:mt-4 text-sm font-normal leading-6 text-gray-600 text-right'>
            اختر من بين مجموعة واسعة من الدورات المصممة خصيصاً لمساعدتك على النمو وتحقيق أهدافك المهنية
          </p>
        </div>

        <div className='mt-12 pb-8 lg:mt-16'>
          <div className='flex flex-col items-center justify-center overflow-hidden'>
            <div
              ref={scrollContainerRef}
              className='flex justify-start w-full gap-6 pb-8 overflow-x-auto snap-x scrollbar-hide'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {loading && categories.length === 0 && (
                <p className='text-sm text-gray-500 px-2'>جارٍ تحميل الفئات...</p>
              )}
              {categories.map((category) => (
                <div key={category.id} className='relative snap-start scroll-mr-6 shrink-0'>
                  <div className='relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow w-60 md:w-80 h-full group rounded-xl hover:shadow-lg hover:-translate-y-1'>
                    <Link
                      href={`/courses/category/${encodeURIComponent(category.slug || category.name)}`}
                      title=''
                      className='flex shrink-0 aspect-w-4 aspect-h-3'
                    >
                      <Image
                        className='object-cover w-full h-full transition-all duration-200 transform group-hover:scale-110'
                        src={category.imageUrl || PLACEHOLDER_COURSE_IMAGE}
                        alt={category.name}
                        width={320}
                        height={240}
                      />
                    </Link>

                    <div className='flex-1 px-4 py-5 sm:p-6 flex flex-col'>
                      <Link
                        href={`/courses/category/${encodeURIComponent(category.slug || category.name)}`}
                        title=''
                      >
                        <p className='text-lg font-bold text-gray-900 text-right'>{category.name}</p>
                        <p className='mt-3 text-sm font-normal leading-6 text-gray-500 line-clamp-2 text-right'>
                          {category.description || 'استكشف الدورات في هذه الفئة'}
                        </p>
                      </Link>
                    </div>

                    <div className='px-4 py-5 mt-auto border-t border-gray-100 sm:px-6'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-gray-900'>
                          {category.courseCount} دورة
                        </p>
                        <Link
                          href={`/courses/category/${encodeURIComponent(category.slug || category.name)}`}
                          title=''
                          role='button'
                        >
                          <svg
                            className='w-5 h-5 text-gray-300 transition-all duration-200 group-hover:text-gray-900 rotate-180'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            strokeWidth='2'
                            stroke='currentColor'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                            <line x1='17' y1='7' x2='7' y2='17' />
                            <polyline points='8 7 17 7 17 16' />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
