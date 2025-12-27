'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { categories } from './Categories'

export function CategoriesPhotoGrid () {
  return (
    <section className='py-14 sm:py-16 lg:py-20 bg-white'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='max-w-xl mx-auto text-right sm:max-w-2xl'>
          <p className='text-sm font-medium text-yellow-600'>استكشف مجالات التعلّم</p>
          <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            تعرّف على أهم <GradientText text='الفئات التعليمية' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className='mt-3 text-sm leading-7 text-gray-600 sm:text-base'>
            صور حقيقية تعبّر عن روح كل مجال، حتى تختار بسهولة المسار الأقرب لأهدافك وشغفك.
          </p>
        </div>

        <div className='grid mt-10 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/courses/category/${encodeURIComponent(category.name.replace(/^ال/, ''))}`}
              className='group relative overflow-hidden rounded-2xl bg-gray-900/5'
            >
              <div className='relative h-52 sm:h-56 lg:h-64'>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                  sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/0' />
              </div>

              <div className='absolute inset-0 flex flex-col justify-end p-5 sm:p-6'>
                <div className='flex items-center justify-between mb-2 text-xs text-yellow-200/90'>
                  <span className='px-3 py-1 rounded-full bg-black/40 border border-white/10'>
                    {category.category}
                  </span>
                  <span className='px-3 py-1 rounded-full bg-black/30 border border-white/10'>
                    {category.courses}
                  </span>
                </div>
                <h3 className='text-lg font-bold text-white sm:text-xl'>
                  {category.name}
                </h3>
                <p className='mt-1 text-xs text-gray-100/90 sm:text-sm line-clamp-2'>
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


