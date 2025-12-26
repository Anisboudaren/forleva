'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

export const courses = [
  {
    id: 1,
    title: 'تعلم React من الصفر',
    instructor: 'ياسين بومدين',
    verified: true,
    recommended: true,
    rating: 4.9,
    students: 1250,
    price: 2990,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    category: 'برمجة'
  },
  {
    id: 2,
    title: 'تصميم واجهات المستخدم',
    instructor: 'ليلى زروقي',
    verified: true,
    recommended: false,
    rating: 4.8,
    students: 980,
    price: 2490,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    category: 'تصميم'
  },
  {
    id: 3,
    title: 'التسويق الرقمي المتقدم',
    instructor: 'عمر بلقاسم',
    verified: false,
    recommended: false,
    rating: 4.9,
    students: 2100,
    price: 3490,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    category: 'تسويق'
  },
  {
    id: 4,
    title: 'Node.js للمحترفين',
    instructor: 'أميرة بن عودة',
    verified: true,
    recommended: false,
    rating: 4.7,
    students: 850,
    price: 3990,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    category: 'برمجة'
  },
  {
    id: 5,
    title: 'ريادة الأعمال الناجحة',
    instructor: 'كمال دحمان',
    verified: true,
    recommended: true,
    rating: 4.8,
    students: 1650,
    price: 2790,
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
    category: 'أعمال'
  },
  {
    id: 6,
    title: 'تعلم اللغة الإنجليزية',
    instructor: 'سارة مزيان',
    verified: false,
    recommended: false,
    rating: 4.9,
    students: 3200,
    price: 1990,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    category: 'لغات'
  }
]

export function PopularCourses () {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section className='relative bg-white pt-12 pb-0 sm:pt-16 sm:pb-0 lg:pt-20 lg:pb-0'>
      <div className='relative z-10 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 lg:max-w-7xl lg:mx-auto'>
        <div className='max-w-2xl mx-auto text-center'>
          <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            أشهر <GradientText text='الدورات التعليمية' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className='mt-3 text-sm leading-7 text-gray-600 sm:text-base'>
            اكتشف أفضل الدورات التي يختارها آلاف المتعلمين لتحقيق أهدافهم المهنية
          </p>
        </div>

        <div className='mt-12 pb-8 lg:mt-16'>
          <div className='flex flex-col items-center justify-center overflow-hidden'>
            <div
              ref={scrollContainerRef}
              className='flex justify-start w-full gap-6 pb-8 overflow-x-auto snap-x scrollbar-hide'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {courses.map((course) => (
                <div
                  key={course.id}
                  className='relative snap-start scroll-mr-6 shrink-0'
                >
                  <div className='relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow w-72 md:w-80 h-full group rounded-xl hover:shadow-lg hover:-translate-y-1'>
                    <Link
                      href={`/courses/${course.id}`}
                      title=''
                      className='flex shrink-0 aspect-w-4 aspect-h-3 relative'
                    >
                      <Image
                        className='object-cover w-full h-full transition-all duration-200 transform group-hover:scale-110'
                        src={course.image}
                        alt={course.title}
                        width={320}
                        height={240}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent' />
                      
                      {/* Category and Rating on Image */}
                      <div className='absolute top-3 right-3 flex flex-col gap-2 items-end'>
                        <span className='text-xs font-semibold text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20'>
                          {course.category}
                        </span>
                        <div className='flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20'>
                          <svg
                            className='w-4 h-4 text-yellow-400'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                          <span className='text-sm font-bold text-white'>{course.rating}</span>
                        </div>
                      </div>
                      
                      {/* Price and Promotion on Image Left */}
                      <div className='absolute bottom-3 left-3 flex flex-col items-start gap-1'>
                        {course.price > 2000 && (
                          <span className='text-sm text-gray-300 line-through bg-black/50 backdrop-blur-sm px-2 py-1 rounded'>
                            {(course.price * 1.3).toLocaleString()} د.ج
                          </span>
                        )}
                        <span 
                          className='text-xl font-black bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border-2'
                          style={{
                            color: '#fbbf24',
                            borderColor: '#fbbf24',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          {course.price.toLocaleString()} د.ج
                        </span>
                      </div>
                      
                      {course.recommended && (
                        <div className='absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full'>
                          موصى به
                        </div>
                      )}
                    </Link>

                    <div className='flex-1 px-4 py-5 sm:p-6 flex flex-col'>
                      <Link href={`/courses/${course.id}`} title=''>
                        <p className='text-lg font-bold text-gray-900 text-right mb-2'>{course.title}</p>
                        <div className='flex items-center gap-2'>
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
                          <p className='text-sm font-normal text-gray-600 text-right'>
                            {course.instructor}
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className='px-4 py-5 mt-auto border-t border-gray-100 sm:px-6'>
                      <Link
                        href={`/courses/${course.id}`}
                        className='inline-flex items-center justify-center w-full px-4 py-2 text-xs font-black text-amber-950 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_10px_25px_rgba(217,119,6,0.45)] hover:brightness-105 transition-all'
                      >
                        ابدأ هذه الدورة الآن
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex items-center justify-end mt-2 space-x-reverse space-x-5'>
              <div className='w-16 h-[3px] rounded-full bg-gray-900' />
              <div className='w-16 h-[3px] rounded-full bg-gray-300' />
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

