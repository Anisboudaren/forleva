'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PopularCourses } from '@/components/popular-courses/PopularCourses'
import { GradientText } from '@/components/text/gradient-text'
import { EnrollDialog, getEnrolledCourseIds } from '@/components/enroll-dialog'
import { VimeoVideoPlayer } from '@/components/vimeo-video-player'
import { isVimeoUrl } from '@/lib/vimeo'
import {
  Play, FileText, ExternalLink, FileCheck, Headphones,
  CheckCircle2, Award, BookOpen, CheckSquare,
  HelpCircle, Loader2, Star
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  EMPTY_SALES_PAGE_DATA,
  DEFAULT_INCLUDED_BENEFITS,
  type SalesPageData,
} from '@/lib/course-sales'
import { getRealPromoSavings } from '@/lib/course-pricing'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'
import { BeforeAfterSlider } from '@/components/courses/BeforeAfterSlider'

const lessonTypes: Record<string, { icon: typeof Play; label: string; color: string }> = {
  VIDEO: { icon: Play, label: 'فيديو', color: 'text-red-500' },
  video: { icon: Play, label: 'فيديو', color: 'text-red-500' },
  QUIZ: { icon: HelpCircle, label: 'كويز', color: 'text-purple-500' },
  quiz: { icon: HelpCircle, label: 'كويز', color: 'text-purple-500' },
  EXTERNAL: { icon: ExternalLink, label: 'رابط خارجي', color: 'text-blue-500' },
  external: { icon: ExternalLink, label: 'رابط خارجي', color: 'text-blue-500' },
  PDF: { icon: FileText, label: 'PDF', color: 'text-red-600' },
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-600' },
  SURVEY: { icon: FileCheck, label: 'نموذج', color: 'text-green-500' },
  survey: { icon: FileCheck, label: 'نموذج', color: 'text-green-500' },
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
  originalPrice?: number | null
  imageUrl: string | null
  videoUrl?: string | null
  duration: string | null
  level: string | null
  language: string | null
  description: string | null
  learningOutcomes: string[]
  salesPageData?: SalesPageData | null
  teacher: {
    id: string
    fullName: string
    bio?: string | null
    avatarUrl?: string | null
  } | null
  sections: CourseSection[]
}

type OrderStatusResponse =
  | { status: 'NONE' }
  | { status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; id: string }

type CourseReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  userName: string
}

function formatPrice(price: number) {
  return `${price.toLocaleString()} د.ج`
}

function getFallbackSalesData(course: CourseData): SalesPageData {
  return {
    hook: {
      title: `حوّل مهاراتك في ${course.category} إلى مستوى أعلى`,
      description:
        course.description ??
        'برنامج عملي ومباشر يساعدك على التعلم بسرعة، التطبيق بثقة، والوصول إلى نتائج واضحة.',
    },
    cta: {
      primaryText: 'اشترك الآن وابدأ التعلم',
      secondaryText: 'انضم اليوم واستفد من المحتوى خطوة بخطوة',
      urgencyNote: 'المقاعد محدودة لضمان متابعة أفضل لكل طالب',
    },
    formationInfo: [
      { title: 'التصنيف', value: course.category },
      { title: 'المستوى', value: course.level ?? 'جميع المستويات' },
      { title: 'اللغة', value: course.language ?? 'العربية' },
      { title: 'المدة', value: course.duration ?? 'حسب تقدمك' },
    ],
    socialProof: [],
    beforeAfter: [
      { before: 'تشتت وعدم وضوح المسار', after: 'خطة واضحة وتطبيق عملي منظم' },
      { before: 'معلومات متفرقة بدون نتيجة', after: 'فهم أعمق ومخرجات قابلة للتنفيذ' },
    ],
    bonuses: [
      { title: 'ملخصات جاهزة', description: 'ملخصات مركزة لكل جزء لتثبيت التعلم بسرعة.', type: 'free' },
      { title: 'تحديثات مستقبلية', description: 'وصول لأي تحسينات أو إضافات جديدة على نفس الدورة.', type: 'free' },
    ],
    includedBenefits: [...DEFAULT_INCLUDED_BENEFITS],
  }
}

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
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [session, setSession] = useState<{ userId: string } | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [reviewChecked, setReviewChecked] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

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

  // Fetch reviews for this course
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setReviewsLoading(true)
    fetch(`/api/courses/${encodeURIComponent(id)}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CourseReview[]) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  // Session and whether current user already reviewed (for form visibility)
  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([
      fetch('/api/auth/session', { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/courses/${encodeURIComponent(id)}/reviews/me`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([sessionRes, meRes]) => {
        if (cancelled) return
        setSession(sessionRes?.user ?? null)
        setHasReviewed(meRes?.hasReviewed === true)
      })
      .catch(() => {
        if (!cancelled) setReviewChecked(true)
      })
      .finally(() => {
        if (!cancelled) setReviewChecked(true)
      })
    return () => { cancelled = true }
  }, [id])

  const refetchReviews = () => {
    if (!id) return
    fetch(`/api/courses/${encodeURIComponent(id)}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CourseReview[]) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || reviewRating < 1 || reviewRating > 5 || reviewSubmitting) return
    setReviewError(null)
    setReviewSubmitting(true)
    fetch(`/api/courses/${encodeURIComponent(id)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() || undefined }),
    })
      .then((res) => {
        if (res.status === 409) {
          setHasReviewed(true)
          setReviewError('لقد قمت بتقييم هذه الدورة مسبقاً')
          return
        }
        if (!res.ok) return res.json().then((d) => { throw new Error(d?.error || 'فشل الإرسال') })
        return res.json()
      })
      .then(() => {
        setReviewRating(0)
        setReviewComment('')
        setHasReviewed(true)
        refetchReviews()
      })
      .catch((err) => {
        setReviewError(err?.message || 'حدث خطأ، جرّب لاحقاً')
      })
      .finally(() => setReviewSubmitting(false))
  }

  const introVimeoUrl = useMemo(() => {
    const main = course?.videoUrl?.trim()
    if (main && isVimeoUrl(main)) return main
    if (!course?.sections?.length) return null
    for (const sec of course.sections) {
      for (const item of sec.items) {
        if ((item.type === 'VIDEO' || item.type === 'video') && item.url) {
          const url = item.url.trim()
          if (isVimeoUrl(url)) return url
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

  const instructorName = course.teacher?.fullName ?? 'مدرّس'
  const salesPageData = (() => {
    const data = course.salesPageData ?? EMPTY_SALES_PAGE_DATA
    const hasContent =
      data.hook.title ||
      data.hook.description ||
      data.cta.primaryText ||
      data.cta.secondaryText ||
      data.cta.urgencyNote ||
      data.formationInfo.length > 0 ||
      data.socialProof.length > 0 ||
      data.beforeAfter.length > 0 ||
      data.bonuses.length > 0
    return hasContent ? data : getFallbackSalesData(course)
  })()
  const hookTitle = salesPageData.hook.title || course.title
  const hookDescription = salesPageData.hook.description || course.description
  const primaryCtaText = salesPageData.cta.primaryText || 'اشترك الآن'
  const promo = getRealPromoSavings(course.price, course.originalPrice)

  const cardClass = 'rounded-xl border border-gray-200 bg-white p-6'
  const headingClass = 'text-lg sm:text-xl font-semibold text-gray-900 mb-4'
  const reveal = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.4, ease: 'easeOut' },
  } as const

  return (
    <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24' dir='rtl'>
      <div className='px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-7xl mx-auto'>
        <nav className='text-sm text-gray-500 mb-6 flex items-center gap-2'>
          <Link href='/' className='hover:text-gray-900 transition-colors'>الرئيسية</Link>
          <span className='text-gray-300'>/</span>
          <Link href='/courses/category/all' className='hover:text-gray-900 transition-colors'>الدورات</Link>
          <span className='text-gray-300'>/</span>
          <span className='text-gray-900 font-medium'>{course.title}</span>
        </nav>

        <motion.header {...reveal} className='mb-8'>
          <h1 className='text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight mb-4'>
            <GradientText text={hookTitle} gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h1>
          {hookDescription && (
            <p className='max-w-3xl text-base sm:text-lg text-gray-600 leading-8 whitespace-pre-wrap'>
              {hookDescription}
            </p>
          )}
          <div className='mt-5 flex flex-wrap items-center gap-2'>
            {course.level && (
              <span className='inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600'>{course.level}</span>
            )}
            {course.duration && (
              <span className='inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600'>{course.duration}</span>
            )}
            {course.language && (
              <span className='inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600'>{course.language}</span>
            )}
          </div>
        </motion.header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10'>
          <aside className='lg:col-start-9 lg:col-span-4 lg:row-start-1'>
            <div className='lg:sticky lg:top-24'>
              <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
                <div className='mb-5'>
                  {promo ? (
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='text-base text-gray-400 tabular-nums line-through decoration-gray-300'>
                          {formatPrice(promo.compareAtPrice)}
                        </p>
                        <p className='mt-1 text-4xl font-bold text-gray-900 tabular-nums leading-none'>
                          {formatPrice(course.price)}
                        </p>
                      </div>
                      <span
                        className='inline-flex items-center rounded-full bg-amber-500 px-3 py-1.5 text-sm font-bold text-white'
                        aria-label={`وفّر ${promo.discountPercent}%`}
                      >
                        وفّر {promo.discountPercent}%
                      </span>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-4xl font-bold text-gray-900 tabular-nums leading-none'>
                        {formatPrice(course.price)}
                      </p>
                      <span className='inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'>
                        عرض محدود
                      </span>
                    </div>
                  )}
                </div>
                {orderStatus === 'CONFIRMED' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/dashboard/student/learning/${course.id}`
                      }}
                      className='w-full rounded-lg bg-emerald-600 text-white py-3 font-semibold shadow-sm hover:bg-emerald-700 transition-colors mb-4 flex items-center justify-center gap-2'
                    >
                      <Play className="w-5 h-5" />
                      <span>تابع تعلمك</span>
                    </button>
                    <div className="w-full rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-800 py-3 px-4 text-sm leading-6">
                      لديك وصول كامل لهذه الدورة. يمكنك العودة إلى الاستوديو في أي وقت من لوحة تحكم الطالب.
                    </div>
                  </>
                ) : isEnrolled || orderStatus === 'PENDING' ? (
                  <div className="w-full rounded-lg border border-green-200 bg-green-50 text-green-800 py-4 px-5 mb-4 flex flex-col items-center justify-center gap-1.5 text-center">
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="font-semibold text-base">
                        {orderLoading ? 'جارٍ التحقق من حالة طلبك...' : 'طلبك قيد المعالجة'}
                      </span>
                    </span>
                    <span className="text-sm text-green-700 font-medium">
                      سنتواصل معك خلال 24 ساعة عبر واتساب أو مكالمة لتأكيد الاشتراك.
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEnrollOpen(true)}
                      className='w-full rounded-lg bg-amber-500 text-white py-3 font-semibold shadow-sm hover:bg-amber-600 transition-colors mb-4'
                    >
                      {primaryCtaText}
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
                    {salesPageData.cta.secondaryText && (
                      <p className='text-sm text-gray-600 text-center mb-2'>
                        {salesPageData.cta.secondaryText}
                      </p>
                    )}
                    {salesPageData.cta.urgencyNote && (
                      <p className='text-xs text-amber-700 text-center mb-4 font-medium'>
                        {salesPageData.cta.urgencyNote}
                      </p>
                    )}
                  </>
                )}
                <ul className='space-y-3 text-sm text-gray-700 border-t border-gray-100 pt-4'>
                  {(salesPageData.includedBenefits?.length
                    ? salesPageData.includedBenefits
                    : DEFAULT_INCLUDED_BENEFITS
                  ).map((benefit) => (
                    <li key={benefit} className='flex items-center gap-2'>
                      <CheckCircle2 className='w-5 h-5 text-emerald-500 flex-shrink-0' />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div className='lg:col-start-1 lg:col-span-8 lg:row-start-1 space-y-6'>
            {introVimeoUrl && (
              <div className='rounded-xl overflow-hidden border border-gray-200 shadow-sm'>
                <VimeoVideoPlayer
                  videoUrl={introVimeoUrl!}
                  title={`مقدمة - ${course.title}`}
                  className='w-full'
                />
              </div>
            )}
              {course.description && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
                >
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>نبذة عن الدورة</h2>
                  <p className='text-sm leading-7 text-gray-700 whitespace-pre-wrap'>{course.description}</p>
                </motion.div>
              )}

              {salesPageData.formationInfo.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
                >
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>معلومات الدورة</h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {salesPageData.formationInfo.map((item, idx) => (
                      <div key={`${item.title}-${idx}`} className='rounded-xl border border-gray-100 bg-gray-50/60 p-4'>
                        <p className='text-xs text-gray-500 mb-1 font-medium'>{item.title}</p>
                        <p className='text-sm font-semibold text-gray-900 leading-6'>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {course.learningOutcomes?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
                >
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>ستتعلّم</h2>
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

              {salesPageData.beforeAfter.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
                >
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>النتيجة قبل وبعد</h2>
                  <div className='space-y-6'>
                    {salesPageData.beforeAfter.map((item, idx) => (
                      <div key={`ba-${idx}`} className='space-y-3'>
                        {item.beforeImageUrl && item.afterImageUrl ? (
                          <BeforeAfterSlider
                            beforeUrl={item.beforeImageUrl}
                            afterUrl={item.afterImageUrl}
                          />
                        ) : (
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            <div className='rounded-xl bg-gray-50 border border-gray-200 p-4'>
                              <p className='text-xs text-gray-500 mb-1 font-medium'>قبل</p>
                              <p className='text-sm text-gray-700 leading-6'>{item.before}</p>
                            </div>
                            <div className='rounded-xl bg-emerald-50/60 border border-emerald-100 p-4'>
                              <p className='text-xs text-emerald-700 mb-1 font-medium'>بعد</p>
                              <p className='text-sm text-gray-700 leading-6'>{item.after}</p>
                            </div>
                          </div>
                        )}
                        {(item.before || item.after) &&
                          item.beforeImageUrl &&
                          item.afterImageUrl && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                              {item.before && (
                                <p className='text-sm text-gray-700 leading-6'>
                                  <span className='font-medium text-slate-600'>قبل: </span>
                                  {item.before}
                                </p>
                              )}
                              {item.after && (
                                <p className='text-sm text-gray-700 leading-6'>
                                  <span className='font-medium text-emerald-700'>بعد: </span>
                                  {item.after}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {salesPageData.bonuses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
                >
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>البونصات</h2>
                  <div className='space-y-3'>
                    {salesPageData.bonuses.map((bonus, idx) => (
                      <div key={`${bonus.title}-${idx}`} className='rounded-xl border border-gray-200 bg-white p-4'>
                        <div className='flex items-start justify-between gap-3 mb-2'>
                          <p className='font-semibold text-gray-900'>{bonus.title}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${bonus.type === 'paid' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                            {bonus.type === 'paid' ? `مدفوع${bonus.price ? ` - ${formatPrice(bonus.price)}` : ''}` : 'مجاني'}
                          </span>
                        </div>
                        {bonus.description && (
                          <p className='text-sm text-gray-700 leading-6'>{bonus.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {course.sections?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='rounded-2xl border border-gray-200 p-6 shadow-sm bg-white'
                >
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'>المنهج</h2>
                  <div className='space-y-4'>
                    {course.sections.map((section) => {
                      const isExpanded = expandedSections[section.title] ?? false
                      return (
                        <div key={section.id} className='rounded-xl border border-gray-200 overflow-hidden'>
                          <button
                            onClick={() => toggleSection(section.title)}
                            className='w-full px-5 py-4 bg-gray-50 text-right flex items-center justify-between hover:bg-gray-100 transition-colors'
                          >
                            <span className='text-base font-semibold text-gray-900'>{section.title}</span>
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
                                    className='px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors group'
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

              <motion.div {...reveal} className={cardClass}>
                <h2 className={headingClass}>عن المدرّس</h2>
                <div className='flex items-center gap-4 mb-4'>
                  {course.teacher?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.teacher.avatarUrl}
                      alt={instructorName}
                      className='w-14 h-14 rounded-full object-cover border border-gray-200'
                    />
                  ) : (
                    <div className='w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700'>
                      {instructorName[0] ?? 'م'}
                    </div>
                  )}
                  <div>
                    <p className='text-base font-semibold text-gray-900'>{instructorName}</p>
                    {course.language && <p className='text-xs text-gray-500 mt-0.5'>{course.language}</p>}
                  </div>
                </div>
                <p className='text-[15px] text-gray-600 leading-7 whitespace-pre-wrap'>
                  {course.teacher?.bio?.trim()
                    ? course.teacher.bio
                    : `مدرّس هذه الدورة في ${course.category}. انضم للدورة للوصول إلى كل المحتوى والدعم.`}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

      <section className='py-12 sm:py-16 border-t border-gray-100'>
        <div className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
          <div className='mb-8'>
            <h2 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2'>
              آراء المتعلمين
            </h2>
            <p className='text-gray-600'>مقتطفات من تعليقات حقيقية حول محتوى الدورة وجودته</p>
          </div>

          {salesPageData.socialProof.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
              {salesPageData.socialProof.map((item, idx) => (
                <div key={`sp-${idx}`} className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
                  {(item.name || item.role || item.rating) && (
                    <div className='flex items-start justify-between gap-3 mb-2'>
                      <div>
                        {item.name && <p className='font-semibold text-gray-900'>{item.name}</p>}
                        {item.role && <p className='text-xs text-gray-600'>{item.role}</p>}
                      </div>
                      {item.rating && (
                        <div className='flex gap-0.5' dir='ltr'>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i <= item.rating! ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {item.quote && (
                    <p className='text-sm text-gray-700 leading-relaxed'>{item.quote}</p>
                  )}
                  {item.imageUrl && (
                    <div className={item.name || item.role || item.quote || item.rating ? 'mt-3' : ''}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSafeCourseImageUrl(item.imageUrl)}
                        alt={item.name || 'شهادة'}
                        className='w-full rounded-lg border border-gray-200 object-contain'
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!session && reviewChecked && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-xl border border-gray-200 bg-gray-50 p-6 mb-8 text-center'
            >
              <p className='text-gray-700 mb-4'>سجّل الدخول لترك تقييم لهذه الدورة</p>
              <Link
                href={`/login?redirect=${encodeURIComponent(`/courses/${id}`)}`}
                className='inline-flex items-center justify-center rounded-lg bg-amber-500 text-white px-6 py-2.5 font-semibold shadow-sm hover:bg-amber-600 transition-colors'
              >
                تسجيل الدخول
              </Link>
            </motion.div>
          )}

          {session && !hasReviewed && reviewChecked && (
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submitReview}
              className='rounded-xl border border-gray-200 p-6 mb-8 bg-white shadow-sm'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>اكتب تقييمك</h3>
              <div className='flex gap-1 mb-4' dir='ltr'>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type='button'
                    onClick={() => setReviewRating(value)}
                    className='p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-400'
                    aria-label={`${value} نجوم`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        value <= reviewRating ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder='اكتب تعليقك (اختياري)...'
                rows={3}
                className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4 resize-y'
              />
              {reviewError && <p className='text-sm text-red-600 mb-2'>{reviewError}</p>}
              <button
                type='submit'
                disabled={reviewRating < 1 || reviewSubmitting}
                className='rounded-lg bg-amber-500 text-white px-6 py-2.5 font-semibold shadow-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </motion.form>
          )}

          {session && hasReviewed && reviewChecked && (
            <div className='rounded-xl border border-emerald-100 bg-emerald-50 p-4 mb-8 text-center'>
              <p className='text-emerald-800 font-medium'>لقد قمت بتقييم هذه الدورة مسبقاً</p>
            </div>
          )}

          <div className='space-y-4'>
            {reviewsLoading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='w-8 h-8 text-amber-500 animate-spin' />
              </div>
            ) : reviews.length === 0 ? (
              <p className='text-center text-gray-500 py-6'>لا توجد تقييمات بعد. كن أول من يقيّم هذه الدورة.</p>
            ) : (
              reviews.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='rounded-xl border border-gray-200 p-5 bg-white shadow-sm'
                >
                  <div className='flex items-start justify-between gap-4 mb-2'>
                    <span className='font-semibold text-gray-900'>{r.userName}</span>
                    <div className='flex gap-0.5' dir='ltr'>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i <= r.rating ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className='text-sm text-gray-700 leading-relaxed mb-2'>{r.comment}</p>}
                  <span className='text-xs text-gray-500'>
                    {new Date(r.createdAt).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <PopularCourses
        excludeCourseId={course.id}
        preferCategory={course.category}
        title='دورات مقترحة'
      />
    </main>
  )
}
