'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { courses } from './PopularCourses'

export function PopularCoursesGrid () {
  return (
    <section className='py-14 sm:py-16 lg:py-20 bg-gray-50'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='max-w-xl mx-auto text-right sm:max-w-2xl'>
          <p className='text-sm font-medium text-yellow-600'>اختر دورتك الأولى</p>
          <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            أشهر <GradientText text='الدورات التعليمية' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className='mt-3 text-sm leading-7 text-gray-600 sm:text-base'>
            دورات عملية مع تطبيق حقيقي، اختر المجال الأنسب لك وابدأ التعلم بخطوة واضحة.
          </p>
        </div>

        <div className='grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3'>
          {courses.map((course) => (
            <div
              key={course.id}
              className='flex flex-col overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
            >
              <Link
                href={`/courses/${course.id}`}
                className='relative h-44 overflow-hidden'
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className='object-cover w-full h-full transition-transform duration-500 hover:scale-110'
                  sizes='(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0' />
                {course.recommended && (
                  <span className='absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm'>
                    موصى به
                  </span>
                )}
                <div className='absolute bottom-3 right-3 text-xs text-gray-100 flex items-center gap-2'>
                  <span className='px-2 py-1 rounded-full bg-black/40 border border-white/10'>
                    {course.category}
                  </span>
                  <span className='px-2 py-1 rounded-full bg-black/30 border border-white/10'>
                    {course.rating} ★
                  </span>
                </div>
              </Link>

              <div className='flex flex-col flex-1 p-5 text-right space-y-2'>
                <h3 className='text-lg font-bold text-gray-900'>{course.title}</h3>
                <p className='text-sm text-gray-600 flex items-center justify-end gap-2'>
                  <span>{course.instructor}</span>
                  {course.verified && (
                    <svg
                      className='w-4 h-4 text-blue-500 flex-shrink-0'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </p>

                <div className='flex items-center justify-between pt-3 mt-auto border-t border-gray-100'>
                  <span className='text-lg font-bold text-gray-900'>
                    {course.price.toLocaleString()} د.ج
                  </span>
                  <Link
                    href={`/courses/${course.id}`}
                    className='inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-amber-950 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_10px_25px_rgba(217,119,6,0.45)] hover:brightness-105 transition-all'
                  >
                    ابدأ هذه الدورة الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


