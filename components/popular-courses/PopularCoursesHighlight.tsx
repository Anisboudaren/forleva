'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { courses } from './PopularCourses'

export function PopularCoursesHighlight () {
  const [featured, ...rest] = courses

  return (
    <section className='py-12 sm:py-16 lg:py-20 bg-white'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center'>
          <div className='order-2 lg:order-1 text-right space-y-4'>
            <p className='text-sm font-medium text-yellow-600'>
              ابدأ بأقوى دورة تناسبك
            </p>
            <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
              دورة <GradientText text={featured.title} gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' /> كنقطة انطلاق حقيقية
            </h2>
            <p className='text-sm leading-7 text-gray-600 sm:text-base'>
              أكثر من {featured.students.toLocaleString()} طالب بدأوا من هنا. محتوى واضح، تطبيق عملي، ومرافقة من مدرب خبير.
            </p>

            <div className='flex flex-wrap items-center gap-4 pt-2'>
              <Link
                href={`/courses/${featured.id}`}
                className='inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-amber-950 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_16px_35px_rgba(217,119,6,0.55)] hover:brightness-105 transition-all'
              >
                ابدأ هذه الدورة الآن
              </Link>
              <p className='text-xs text-gray-600'>
                بدون التزام طويل، يمكنك البدء اليوم ومتابعة الدروس بالوتيرة التي تناسبك.
              </p>
            </div>

            <div className='grid gap-3 pt-4 text-xs text-gray-700 sm:grid-cols-3'>
              {rest.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className='flex flex-col justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all'
                >
                  <p className='font-semibold text-gray-900 line-clamp-2'>
                    {course.title}
                  </p>
                  <p className='mt-1 text-[11px] text-gray-600'>
                    {course.category} • {course.rating} ★ • {course.students.toLocaleString()} طالب
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className='order-1 lg:order-2'>
            <div className='relative w-full max-w-md mx-auto'>
              <div className='absolute -inset-6 rounded-[2.25rem] bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-500 opacity-70 blur-3xl' />
              <Link
                href={`/courses/${featured.id}`}
                className='relative flex flex-col overflow-hidden bg-white border border-gray-100 rounded-[2.25rem] shadow-[0_22px_60px_rgba(15,23,42,0.18)]'
              >
                <div className='relative h-52'>
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    className='object-cover w-full h-full'
                    sizes='(min-width: 1024px) 24rem, 20rem'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/0' />
                  <div className='absolute top-4 left-4 flex flex-col items-start gap-2'>
                    {featured.recommended && (
                      <span className='px-3 py-1 text-xs font-semibold text-amber-950 bg-amber-300 rounded-full shadow-sm'>
                        الأكثر اختياراً
                      </span>
                    )}
                    <span className='px-3 py-1 text-[11px] font-medium text-white/90 bg-black/35 rounded-full border border-white/10'>
                      {featured.category} • {featured.rating} ★
                    </span>
                  </div>
                  <div className='absolute bottom-4 right-4 left-4 text-right'>
                    <p className='text-sm font-medium text-gray-100'>
                      {featured.instructor}{' '}
                      {featured.verified && (
                        <span className='inline-flex items-center gap-1 text-[11px] text-emerald-200'>
                          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                              clipRule='evenodd'
                            />
                          </svg>
                          مدرب موثوق
                        </span>
                      )}
                    </p>
                    <p className='mt-1 text-xs text-gray-200'>
                      أكثر من {featured.students.toLocaleString()} طالب بدأوا هذه الدورة
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100'>
                  <span className='text-lg font-bold text-gray-900'>
                    {featured.price.toLocaleString()} د.ج
                  </span>
                  <span className='text-xs text-gray-500'>
                    وصول كامل لجميع الدروس فوراً
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


