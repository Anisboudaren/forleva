'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

const categories = [
  {
    id: 1,
    name: 'البرمجة',
    description: 'تعلم البرمجة والتطوير من الصفر حتى الاحتراف',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    category: 'تقنية',
    lessons: '120+ درس'
  },
  {
    id: 2,
    name: 'التصميم',
    description: 'مهارات التصميم والإبداع البصري',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    category: 'إبداعي',
    lessons: '85+ درس'
  },
  {
    id: 3,
    name: 'التسويق',
    description: 'استراتيجيات التسويق الرقمي والنمو',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    category: 'أعمال',
    lessons: '95+ درس'
  },
  {
    id: 4,
    name: 'الأعمال',
    description: 'ريادة الأعمال والإدارة الحديثة',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
    category: 'أعمال',
    lessons: '110+ درس'
  },
  {
    id: 5,
    name: 'اللغات',
    description: 'تعلم اللغات الأجنبية بطرق حديثة',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    category: 'لغات',
    lessons: '150+ درس'
  },
  {
    id: 6,
    name: 'الصحة',
    description: 'اللياقة البدنية والصحة النفسية',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    category: 'صحة',
    lessons: '75+ درس'
  }
]

export function Categories () {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  function mapToCourseCategory (displayName: string) {
    if (displayName.includes('البرمجة')) return 'برمجة'
    if (displayName.includes('التصميم')) return 'تصميم'
    if (displayName.includes('التسويق')) return 'تسويق'
    if (displayName.includes('الأعمال')) return 'أعمال'
    if (displayName.includes('اللغات')) return 'لغات'
    // fallback
    return displayName.replace(/^ال/, '')
  }

  return (
    <section className='relative bg-gray-50'>
      <div className='relative z-10 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 lg:max-w-7xl lg:mx-auto lg:py-20 xl:py-28'>
        <div className='max-w-md mx-auto sm:max-w-lg lg:mx-0 lg:mr-auto'>
          <h2 className='text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl text-right'>
            استكشف <GradientText text='الفئات' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' /> المتنوعة
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
                msOverflowStyle: 'none'
              }}
            >
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className='relative snap-start scroll-mr-6 shrink-0'
                >
                  <div className='relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow w-60 md:w-80 h-full group rounded-xl hover:shadow-lg hover:-translate-y-1'>
                    <Link
                      href={`/courses/${encodeURIComponent(mapToCourseCategory(category.name))}`}
                      title=''
                      className='flex shrink-0 aspect-w-4 aspect-h-3'
                    >
                      <Image
                        className='object-cover w-full h-full transition-all duration-200 transform group-hover:scale-110'
                        src={category.image}
                        alt={category.name}
                        width={320}
                        height={240}
                      />
                    </Link>

                    <div className='flex-1 px-4 py-5 sm:p-6 flex flex-col'>
                      <Link href={`/courses/${encodeURIComponent(mapToCourseCategory(category.name))}`} title=''>
                        <p className='text-lg font-bold text-gray-900 text-right'>{category.name}</p>
                        <p className='mt-3 text-sm font-normal leading-6 text-gray-500 line-clamp-2 text-right'>
                          {category.description}
                        </p>
                      </Link>
                    </div>

                    <div className='px-4 py-5 mt-auto border-t border-gray-100 sm:px-6'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-reverse space-x-2'>
                          <p className='text-sm font-medium text-gray-900'>
                            <Link href={`/courses/${encodeURIComponent(mapToCourseCategory(category.name))}`} title=''>{category.category}</Link>
                          </p>
                          <span className='text-sm font-medium text-gray-900'>•</span>
                          <p className='text-sm font-medium text-gray-900'>{category.lessons}</p>
                        </div>
                        <Link
                          href={`/courses/${encodeURIComponent(mapToCourseCategory(category.name))}`}
                          title=''
                          className=''
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

