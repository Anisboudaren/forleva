'use client'

import Link from 'next/link'
import { SafeCourseImage } from '@/components/safe-course-image'
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { normalizeCategoryName } from '@/lib/course-categories'

type CourseCard = {
  id: string
  title: string
  category: string
  categorySlug?: string | null
  price: number
  imageUrl: string | null
  duration: string | null
  level: string | null
  language: string | null
  instructor: string
  instructorAvatar?: string | null
}

type CategoryOption = {
  id: string
  name: string
  slug: string
}

export default function CoursesByCategoryPage() {
  const params = useParams()
  const raw = (params?.category as string) || 'all'
  const decode = decodeURIComponent(raw)
  const normalizedParam = normalizeCategoryName(decode) || 'all'

  const [courses, setCourses] = useState<CourseCard[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch('/api/courses').then((res) => res.json()),
      fetch('/api/categories').then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([courseData, categoryData]) => {
        if (cancelled) return
        setCourses(Array.isArray(courseData) ? courseData : [])
        setCategoryOptions(Array.isArray(categoryData) ? categoryData : [])
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([])
          setCategoryOptions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filterChips = useMemo(() => {
    if (categoryOptions.length > 0) {
      return categoryOptions.map((c) => ({
        key: c.slug || c.name,
        label: c.name,
        hrefValue: c.slug || c.name,
      }))
    }
    return Array.from(new Set(courses.map((c) => c.category))).map((cat) => ({
      key: cat,
      label: cat,
      hrefValue: cat,
    }))
  }, [categoryOptions, courses])

  const filtered = useMemo(() => {
    if (!normalizedParam || normalizedParam === 'all') return courses
    return courses.filter((c) => {
      const bySlug =
        c.categorySlug &&
        (c.categorySlug === decode ||
          normalizeCategoryName(c.categorySlug) === normalizedParam)
      const byName = normalizeCategoryName(c.category) === normalizedParam
      return Boolean(bySlug || byName)
    })
  }, [courses, normalizedParam, decode])

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
              <GradientText
                text='الدورات التعليمية'
                gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              />
            </h1>
            {normalizedParam !== 'all' && (
              <p className='text-lg text-gray-600 mt-2'>تُعرض الآن فئة: {decode}</p>
            )}
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
            {filterChips.map((cat) => {
              const active =
                normalizedParam === normalizeCategoryName(cat.label) ||
                decode === cat.hrefValue
              return (
                <Link
                  key={cat.key}
                  href={`/courses/category/${encodeURIComponent(cat.hrefValue)}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    active
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-600 hover:shadow-md'
                  }`}
                >
                  {cat.label}
                </Link>
              )
            })}
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
              <p className='text-sm text-gray-600 mb-6 text-center'>
                {filtered.length} دورة
              </p>
              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {filtered.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                  >
                    <Link
                      href={`/courses/${course.id}`}
                      className='group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow'
                    >
                      <div className='relative aspect-[4/3] overflow-hidden bg-gray-100'>
                        <SafeCourseImage
                          src={course.imageUrl}
                          alt={course.title}
                          fill
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        />
                      </div>
                      <div className='p-5'>
                        <p className='text-xs font-semibold text-amber-600 mb-2'>
                          {course.category}
                        </p>
                        <h2 className='text-lg font-bold text-gray-900 line-clamp-2 mb-2'>
                          {course.title}
                        </h2>
                        <div className='flex items-center gap-2 mb-3'>
                          {course.instructorAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.instructorAvatar}
                              alt={course.instructor}
                              className='w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0'
                            />
                          ) : null}
                          <p className='text-sm text-gray-600'>{course.instructor}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-lg font-black text-amber-500'>
                            {course.price.toLocaleString()} د.ج
                          </span>
                          {(course.level || course.duration) && (
                            <span className='text-xs text-gray-500'>
                              {[course.level, course.duration].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className='text-center py-16'>
              <p className='text-gray-600 mb-4'>لا توجد دورات في هذه الفئة حالياً.</p>
              <Link
                href='/courses/category/all'
                className='inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600'
              >
                عرض كل الدورات
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
