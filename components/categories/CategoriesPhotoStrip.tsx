'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { categories } from './Categories'

export function CategoriesPhotoStrip () {
  return (
    <section className='py-12 sm:py-16 lg:py-20 bg-gray-50'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div className='text-right max-w-xl'>
            <p className='text-sm font-medium text-yellow-600'>مجالات عملية ومتنوعة</p>
            <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
              اختر الفئة التي تناسب{' '}
              <GradientText text='هدفك القادم' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h2>
          </div>
          <p className='text-sm leading-7 text-gray-600 sm:max-w-md text-right'>
            من البرمجة إلى الأعمال واللغات، كل فئة تحتوي على مسارات واضحة تساعدك على الانتقال من التعلّم إلى التطبيق.
          </p>
        </div>

        <div className='mt-8 overflow-x-auto scrollbar-hide'>
          <div className='flex gap-4 sm:gap-6 min-w-max'>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/courses/category/${encodeURIComponent(category.name.replace(/^ال/, ''))}`}
                className='group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 w-64 sm:w-72'
              >
                <div className='relative h-40'>
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                    sizes='(min-width: 1024px) 18rem, 16rem'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0' />
                  <div className='absolute bottom-0 right-0 left-0 p-4'>
                    <p className='text-xs font-medium text-yellow-200'>
                      {category.category} • {category.lessons}
                    </p>
                    <h3 className='mt-1 text-lg font-bold text-white'>
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className='p-4 text-right'>
                  <p className='text-xs text-gray-600 line-clamp-2'>
                    {category.description}
                  </p>
                </div>
              </Link>
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


