'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'

const mockCourses = [
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

export default function CoursesByCategoryPage () {
  const params = useParams()
  const raw = (params?.category as string) || 'all'
  const decode = decodeURIComponent(raw)
  const normalize = (s: string) => s.replace(/^ال/, '').trim()
  const normalizedParam = normalize(decode) || 'all'

  const categories = useMemo(() => Array.from(new Set(mockCourses.map(c => c.category))), [])

  const filtered = useMemo(() => {
    if (!normalizedParam || normalizedParam === 'all') return mockCourses
    return mockCourses.filter(c => normalize(c.category) === normalizedParam)
  }, [normalizedParam])

  return (
    <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24' dir='rtl'>
      {/* Hero Section */}
      <section className='relative py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-amber-50/30 via-white to-white'>
        <div className='absolute inset-0 opacity-[0.02]' 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className='relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
          <div className='text-center mb-10 sm:mb-12'>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3'>
              <GradientText text='الدورات التعليمية' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h1>
            {normalizedParam !== 'all' && (
              <p className='text-lg text-gray-600 mt-2'>تُعرض الآن فئة: {decode}</p>
            )}
          </div>

          {/* Category Filters */}
          <div className='flex flex-wrap gap-3 justify-center max-w-4xl mx-auto'>
            <Link 
              href='/courses/category/all' 
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                normalizedParam === 'all' 
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg scale-105' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-600 hover:shadow-md'
              }`}
            >
              الكل
            </Link>
            {categories.map(cat => (
              <Link
                key={cat}
                href={`/courses/category/${encodeURIComponent(cat)}`}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  normalizedParam === normalize(cat)
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-600 hover:shadow-md'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className='py-8 sm:py-12 lg:py-16'>
        <div className='px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
          {filtered.length > 0 ? (
            <>
              <div className='mb-6 text-center'>
                <p className='text-sm text-gray-600'>
                  تم العثور على <span className='font-bold text-amber-600'>{filtered.length}</span> دورة
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8'>
                {filtered.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className='relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow group rounded-xl hover:shadow-lg hover:-translate-y-1 h-full'>
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
                        
                        {/* Rating on Image */}
                        <div className='absolute top-3 right-3 flex flex-col gap-2 items-end'>
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
                        <div className='absolute bottom-3 left-3 flex flex-col gap-1.5'>
                          {course.price > 2000 && (
                            <span 
                              className='inline-flex items-center justify-center w-fit text-sm font-semibold whitespace-nowrap bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-white/30'
                              style={{
                                color: '#ffffff',
                                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                textDecoration: 'line-through',
                                textDecorationColor: 'rgba(255, 255, 255, 0.7)',
                                textDecorationThickness: '2px',
                                textUnderlineOffset: '0.3em'
                              }}
                            >
                              {Math.round(course.price * 1.3).toLocaleString()} د.ج
                            </span>
                          )}
                          <span 
                            className='inline-block text-xl font-black bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border-2'
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
                          <div className='flex items-center gap-2 mb-2'>
                            <p className='text-lg font-bold text-gray-900 text-right'>{course.title}</p>
                            <span className='inline-flex items-center justify-center text-xs font-bold text-amber-950 bg-amber-200 px-3 py-1.5 rounded-full border border-amber-300/50 shadow-sm whitespace-nowrap flex-shrink-0'>
                              {course.category}
                            </span>
                          </div>
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
                          أستكشف الدورة
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className='text-center py-16'>
              <p className='text-lg text-gray-600 mb-4'>لم يتم العثور على دورات</p>
              <p className='text-sm text-gray-500'>جرب البحث بكلمات مختلفة</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
