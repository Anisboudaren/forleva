'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PopularCourses } from '@/components/popular-courses/PopularCourses'
import { GradientText } from '@/components/text/gradient-text'
import { EnrollDialog, getEnrolledCourseIds } from '@/components/enroll-dialog'
import {
  Play, FileText, ExternalLink, FileCheck, Headphones,
  CheckCircle2, Award, BookOpen, CheckSquare, MessageSquare,
  HelpCircle, Loader2
} from 'lucide-react'
import { motion } from 'motion/react'

const lessonTypes: Record<string, { icon: typeof Play; label: string; color: string }> = {
  VIDEO: { icon: Play, label: 'فيديو', color: 'text-red-500' },
  video: { icon: Play, label: 'فيديو', color: 'text-red-500' },
  QUIZ: { icon: HelpCircle, label: 'كويز', color: 'text-purple-500' },
  quiz: { icon: HelpCircle, label: 'كويز', color: 'text-purple-500' },
  EXTERNAL: { icon: ExternalLink, label: 'رابط خارجي', color: 'text-blue-500' },
  external: { icon: ExternalLink, label: 'رابط خارجي', color: 'text-blue-500' },
  PDF: { icon: FileText, label: 'PDF', color: 'text-red-600' },
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-600' },
  SURVEY: { icon: FileCheck, label: 'استبيان', color: 'text-green-500' },
  survey: { icon: FileCheck, label: 'استبيان', color: 'text-green-500' },
  TITLE: { icon: BookOpen, label: 'عنوان', color: 'text-gray-500' },
  title: { icon: BookOpen, label: 'عنوان', color: 'text-gray-500' },
  CERTIFICATE: { icon: Award, label: 'شهادة', color: 'text-amber-500' },
  certificate: { icon: Award, label: 'شهادة', color: 'text-amber-500' },
  EXERCISE: { icon: CheckSquare, label: 'تمرين', color: 'text-indigo-500' },
  exercise: { icon: CheckSquare, label: 'تمرين', color: 'text-indigo-500' },
  AUDIO: { icon: Headphones, label: 'صوتي', color: 'text-pink-500' },
  audio: { icon: Headphones, label: 'صوتي', color: 'text-pink-500' },
  CHECKLIST: { icon: CheckCircle2, label: 'قائمة', color: 'text-teal-500' },
  checklist: { icon: CheckCircle2, label: 'قائمة', color: 'text-teal-500' },
}

type CourseSectionItem = {
  id: string
  type: string
  title: string
  duration?: string
  url?: string
  position: number
}

type CourseSection = {
  id: string
  title: string
  position: number
  items: CourseSectionItem[]
}

type CourseData = {
  id: string
  title: string
  category: string
  price: number
  imageUrl: string | null
  duration: string | null
  level: string | null
  language: string | null
  description: string | null
  learningOutcomes: string[]
  teacher: { id: string; fullName: string } | null
  sections: CourseSection[]
}

type OrderStatusResponse =
  | { status: 'NONE' }
  | { status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; id: string }

function formatPrice(price: number) {
  return `${price.toLocaleString()} د.ج`
}

function youtubeWatchToEmbed(url: string | undefined): string | null {
  if (!url || !url.includes('youtube')) return null
  const match = url.match(/[?&]v=([^&]+)/)
  const id = match ? match[1] : null
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop'

export default function CoursePage() {
  const params = useParams()
  const id = (params?.id as string) || ''
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [orderStatus, setOrderStatus] = useState<'NONE' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('NONE')
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('معرف الدورة غير صالح')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/courses/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('الدورة غير موجودة أو غير منشورة')
          throw new Error('فشل تحميل الدورة')
        }
        return res.json()
      })
      .then((data: CourseData) => {
        if (!cancelled) {
          setCourse(data)
          setIsEnrolled(getEnrolledCourseIds().includes(data.id))
          const firstSection = data.sections?.[0]
          if (firstSection) {
            setExpandedSections({ [firstSection.title]: true })
          }
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'حدث خطأ')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  // Check server-side order status for this course for the current user
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setOrderLoading(true)
    fetch(`/api/orders/by-course?courseId=${encodeURIComponent(id)}`, {
      credentials: 'include',
    })
      .then((res) => res.ok ? res.json() as Promise<OrderStatusResponse> : null)
      .then((data) => {
        if (cancelled || !data) return
        if (data.status === 'NONE') {
          setOrderStatus('NONE')
        } else {
          setOrderStatus(data.status)
          if (data.status === 'PENDING' || data.status === 'CONFIRMED') {
            setIsEnrolled(true)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setOrderStatus('NONE')
      })
      .finally(() => {
        if (!cancelled) setOrderLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const introEmbedUrl = useMemo(() => {
    if (!course?.sections?.length) return null
    for (const sec of course.sections) {
      for (const item of sec.items) {
        if ((item.type === 'VIDEO' || item.type === 'video') && item.url) {
          const embed = youtubeWatchToEmbed(item.url)
          if (embed) return embed
        }
      }
    }
    return null
  }, [course])

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }))
  }

  if (loading) {
    return (
      <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24 min-h-screen flex items-center justify-center' dir='rtl'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-12 h-12 text-amber-500 animate-spin' />
          <p className='text-gray-600'>جاري تحميل الدورة...</p>
        </div>
      </main>
    )
  }

  if (error || !course) {
    return (
      <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24 min-h-screen' dir='rtl'>
        <div className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>لم يتم العثور على الدورة</h1>
          <p className='text-gray-600 mb-6'>{error ?? 'الدورة غير موجودة أو غير منشورة.'}</p>
          <Link
            href='/courses/category/all'
            className='inline-flex items-center justify-center rounded-full bg-amber-500 text-white px-6 py-3 font-semibold hover:bg-amber-600 transition-colors'
          >
            تصفح الدورات
          </Link>
        </div>
      </main>
    )
  }

  const imageSrc = course.imageUrl || PLACEHOLDER_IMAGE
  const instructorName = course.teacher?.fullName ?? 'مدرّس'

  return (
    <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24' dir='rtl'>
      <section className='relative bg-gradient-to-b from-amber-50/30 via-white to-white pb-8'>
        <div
          className='absolute inset-0 opacity-[0.02]'
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className='relative px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto'>
          <nav className='text-sm text-gray-600 mb-4 flex items-center gap-2'>
            <Link href='/' className='hover:text-amber-600 transition-colors'>الرئيسية</Link>
            <span>/</span>
            <Link href='/courses/category/all' className='hover:text-amber-600 transition-colors'>الدورات</Link>
            <span>/</span>
            <span className='text-gray-900 font-semibold'>{course.title}</span>
          </nav>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-8'>
              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
                <GradientText text={course.title} gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
              </h1>
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6'>
                {course.level && <span>{course.level}</span>}
                {course.duration && (
                  <>
                    {course.level && <span>•</span>}
                    <span>{course.duration}</span>
                  </>
                )}
                {course.language && (
                  <>
                    {(course.level || course.duration) && <span>•</span>}
                    <span>{course.language}</span>
                  </>
                )}
              </div>

              <div className='mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-200'>
                <Image
                  className='w-full h-auto object-cover'
                  src={imageSrc}
                  alt={course.title}
                  width={1920}
                  height={960}
                  sizes='(min-width: 1280px) 896px, (min-width: 1024px) 75vw, 100vw'
                  quality={95}
                  priority
                />
              </div>

              {introEmbedUrl && (
                <div className='rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg'>
                  <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className='absolute top-0 left-0 w-full h-full'
                      src={`${introEmbedUrl}?rel=0&modestbranding=1&playsinline=1`}
                      title={`مقدمة - ${course.title}`}
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                      referrerPolicy='strict-origin-when-cross-origin'
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            <aside className='lg:col-span-4'>
              <div className='sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-3xl font-black text-gray-900'>{formatPrice(course.price)}</span>
                </div>
                {orderStatus === 'CONFIRMED' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/dashboard/student/learning/${course.id}`
                      }}
                      className='w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white py-3 font-bold shadow-[0_10px_25px_rgba(16,185,129,0.45)] hover:brightness-105 transition-all mb-4 flex items-center justify-center gap-2'
                    >
                      <Play className="w-5 h-5" />
                      <span>تابع تعلمك</span>
                    </button>
                    <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/70 text-emerald-800 py-3 px-4 text-sm">
                      لديك وصول كامل لهذه الدورة. يمكنك العودة إلى الاستوديو في أي وقت من لوحة تحكم الطالب.
                    </div>
                  </>
                ) : isEnrolled || orderStatus === 'PENDING' ? (
                  <div className="w-full rounded-2xl border-2 border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50/80 text-green-800 py-4 px-5 mb-4 flex flex-col items-center justify-center gap-1.5 shadow-[0_2px_12px_rgba(34,197,94,0.12)]">
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="font-bold text-base">
                        {orderLoading ? 'جارٍ التحقق من حالة طلبك...' : 'طلبك قيد المعالجة'}
                      </span>
                    </span>
                    <span className="text-sm text-green-700/90 font-medium">
                      سنتواصل معك خلال 24 ساعة عبر واتساب أو مكالمة لتأكيد الاشتراك.
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEnrollOpen(true)}
                      className='w-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white py-3 font-bold shadow-[0_10px_25px_rgba(217,119,6,0.45)] hover:brightness-105 transition-all mb-4'
                    >
                      اشترك الآن
                    </button>
                    <EnrollDialog
                      open={enrollOpen}
                      onOpenChange={setEnrollOpen}
                      course={course ? { id: course.id, title: course.title, price: course.price } : null}
                      onEnrollSuccess={() => {
                        setIsEnrolled(true)
                        setOrderStatus('PENDING')
                      }}
                    />
                  </>
                )}
                <ul className='space-y-3 text-sm text-gray-700 border-t border-gray-200 pt-4'>
                  <li className='flex items-center gap-2'>
                    <CheckCircle2 className='w-5 h-5 text-green-500 flex-shrink-0' />
                    <span>وصول لمدة 12 شهر</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <CheckCircle2 className='w-5 h-5 text-green-500 flex-shrink-0' />
                    <span>شهادة مشاركة</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <CheckCircle2 className='w-5 h-5 text-green-500 flex-shrink-0' />
                    <span>تحديثات مجانية للمحتوى</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className='py-10 sm:py-14'>
        <div className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-8'>
              {course.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm bg-white'
                >
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>نبذة عن الدورة</h2>
                  <p className='text-sm leading-7 text-gray-700 whitespace-pre-wrap'>{course.description}</p>
                </motion.div>
              )}

              {course.learningOutcomes?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm bg-white'
                >
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>ستتعلّم</h2>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {course.learningOutcomes.map((item, i) => (
                      <li key={i} className='flex items-start gap-2 text-sm text-gray-700'>
                        <CheckCircle2 className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {course.sections?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='rounded-2xl border border-gray-200 p-6 shadow-sm bg-white'
                >
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>المنهج</h2>
                  <div className='space-y-4'>
                    {course.sections.map((section) => {
                      const isExpanded = expandedSections[section.title] ?? false
                      return (
                        <div key={section.id} className='rounded-xl border border-gray-200 overflow-hidden'>
                          <button
                            onClick={() => toggleSection(section.title)}
                            className='w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-white text-right flex items-center justify-between hover:from-gray-100 transition-all'
                          >
                            <span className='text-base font-bold text-gray-900'>{section.title}</span>
                            <span className='text-sm text-gray-600'>
                              {section.items.length} درس
                              <span className={`inline-block mr-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                            </span>
                          </button>
                          {isExpanded && (
                            <ul className='divide-y divide-gray-100 bg-white'>
                              {section.items.map((item) => {
                                const typeKey = item.type in lessonTypes ? item.type : 'title'
                                const typeInfo = lessonTypes[typeKey] ?? lessonTypes.title
                                const TypeIcon = typeInfo.icon
                                return (
                                  <li
                                    key={item.id}
                                    className='px-5 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors group'
                                  >
                                    <div className='flex items-center gap-3 flex-1'>
                                      <TypeIcon className={`w-5 h-5 ${typeInfo.color} flex-shrink-0`} />
                                      <div className='flex-1 text-right'>
                                        <span className='text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors'>{item.title}</span>
                                        <span className='text-xs text-gray-500 mr-2'>({typeInfo.label})</span>
                                      </div>
                                    </div>
                                    <span className='text-xs text-gray-500'>{item.duration ?? '-'}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='rounded-2xl border border-gray-200 p-6 mt-6 shadow-sm bg-white'
              >
                <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                  <MessageSquare className='w-6 h-6 text-amber-600' />
                  الأسئلة والأجوبة
                </h2>
                <p className='text-sm text-gray-600 mb-4'>مكان طرح والإجابة على الأسئلة بالكتابة، الصور، والصوت</p>
                <button className='w-full py-2.5 text-sm font-semibold text-amber-600 border-2 border-amber-300 rounded-lg hover:bg-amber-50 transition-colors'>
                  طرح سؤال جديد
                </button>
              </motion.div>
            </div>

            <aside className='lg:col-span-4'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='rounded-2xl border border-gray-200 p-6 shadow-sm bg-white'
              >
                <h3 className='text-lg font-bold text-gray-900 mb-4'>عن المدرّس</h3>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-700 border-2 border-amber-200'>
                    {instructorName[0] ?? 'م'}
                  </div>
                  <div>
                    <p className='text-base font-bold text-gray-900'>{instructorName}</p>
                    {course.language && <p className='text-xs text-gray-600 mt-1'>{course.language}</p>}
                  </div>
                </div>
                <p className='text-sm text-gray-700 leading-7'>
                  مدرّس هذه الدورة في {course.category}. انضم للدورة للوصول إلى كل المحتوى والدعم.
                </p>
              </motion.div>
            </aside>
          </div>
        </div>
      </section>

      <section className='py-10 sm:py-14 bg-gradient-to-b from-gray-50 to-white'>
        <div className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
          <div className='text-center mb-10'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>
              آراء <GradientText text='المتعلمين' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h2>
            <p className='text-gray-600'>مقتطفات من تعليقات حقيقية حول محتوى الدورة وجودته</p>
          </div>
        </div>
      </section>

      <PopularCourses />
    </main>
  )
}
