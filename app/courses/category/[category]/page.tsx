'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'

type CourseCard = {
  id: string
  title: string
  category: string
  price: number
  imageUrl: string | null
  duration: string | null
  level: string | null
  language: string | null
  instructor: string
}

export default function CoursesByCategoryPage() {
  const params = useParams()
  const raw = (params?.category as string) || 'all'
  const decode = decodeURIComponent(raw)
  const normalize = (s: string) => s.replace(/^ال/, '').trim()
  const normalizedParam = normalize(decode) || 'all'

  const [courses, setCourses] = useState<CourseCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data: CourseCard[]) => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setCourses([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const categories = useMemo(() => Array.from(new Set(courses.map((c) => c.category))), [courses])

  const filtered = useMemo(() => {
    if (!normalizedParam || normalizedParam === 'all') return courses
    return courses.filter((c) => normalize(c.category) === normalizedParam)
  }, [courses, normalizedParam])

  return (
    <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24' dir='rtl'>
      <section className='relative py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-amber-50/30 via-white to-white'>
        <div
          className='absolute inset-0 opacity-[0.02]'
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className='relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
          <div className='text-center mb-10 sm:mb-12'>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3'>
              <GradientText text='الدورات التعليمية' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h1>
            {normalizedParam !== 'all' && <p className='text-lg text-gray-600 mt-2'>تُعرض الآن فئة: {decode}</p>}
          </div>

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
            {categories.map((cat) => (
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

      <section className='py-8 sm:py-12 lg:py-16'>
        <div className='px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
          {loading ? (
            <div className='flex justify-center py-16'>
              <Loader2 className='w-12 h-12 text-amber-500 animate-spin' />
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className='mb-6 text-center'>
                <p className='text-sm text-gray-600'>
                  تم العثور على <span className='font-bold text-amber-600'>{filtered.length}</span> دورة
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8'>
                {filtered.map((course, index) => {
                  const imageSrc = course.imageUrl || PLACEHOLDER_IMAGE
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className='relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow group rounded-xl hover:shadow-lg hover:-translate-y-1 h-full'>
                        <Link href={`/courses/${course.id}`} title='' className='flex shrink-0 aspect-w-4 aspect-h-3 relative block overflow-hidden'>
                          <Image
                            className='object-cover w-full h-full transition-all duration-200 transform group-hover:scale-110'
                            src={imageSrc}
                            alt={course.title}
                            width={320}
                            height={240}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent' />
                          <div className='absolute bottom-3 left-3'>
                            <span
                              className='inline-block text-xl font-black bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border-2'
                              style={{
                                color: '#fbbf24',
                                borderColor: '#fbbf24',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                              }}
                            >
                              {course.price.toLocaleString()} د.ج
                            </span>
                          </div>
                        </Link>

                        <div className='flex-1 px-4 py-5 sm:p-6 flex flex-col'>
                          <Link href={`/courses/${course.id}`} title=''>
                            <div className='flex items-center gap-2 mb-2'>
                              <p className='text-lg font-bold text-gray-900 text-right'>{course.title}</p>
                              <span className='inline-flex items-center justify-center text-xs font-bold text-amber-950 bg-amber-200 px-3 py-1.5 rounded-full border border-amber-300/50 shadow-sm whitespace-nowrap flex-shrink-0'>
                                {course.category}
                              </span>
                            </div>
                            <p className='text-sm font-normal text-gray-600 text-right'>{course.instructor}</p>
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
                  )
                })}
              </div>
            </>
          ) : (
            <div className='text-center py-16'>
              <p className='text-lg text-gray-600 mb-4'>لم يتم العثور على دورات</p>
              <p className='text-sm text-gray-500'>جرب اختيار فئة أخرى أو عد لاحقاً</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
