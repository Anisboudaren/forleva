'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PopularCourses } from '@/components/popular-courses/PopularCourses'
import { GradientText } from '@/components/text/gradient-text'
import { 
  Play, FileText, ExternalLink, Download, FileCheck, Headphones, 
  CheckCircle2, Award, BookOpen, CheckSquare, MessageSquare, 
  Image as ImageIcon, Mic, Link as LinkIcon, HelpCircle
} from 'lucide-react'
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
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
    category: 'برمجة',
    duration: '8 أسابيع',
    level: 'مبتدئ إلى متوسط',
    language: 'العربية',
    lastUpdated: 'نوفمبر 2025'
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
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop',
    category: 'تصميم',
    duration: '10 أسابيع',
    level: 'كافة المستويات',
    language: 'العربية',
    lastUpdated: 'أكتوبر 2025'
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    category: 'تسويق',
    duration: '6 أسابيع',
    level: 'متوسط',
    language: 'العربية',
    lastUpdated: 'سبتمبر 2025'
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
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop',
    category: 'برمجة',
    duration: '12 أسبوع',
    level: 'متقدم',
    language: 'العربية',
    lastUpdated: 'أغسطس 2025'
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
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop',
    category: 'أعمال',
    duration: '7 أسابيع',
    level: 'كافة المستويات',
    language: 'العربية',
    lastUpdated: 'يونيو 2025'
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
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    category: 'لغات',
    duration: '9 أسابيع',
    level: 'مبتدئ',
    language: 'العربية',
    lastUpdated: 'مايو 2025'
  }
]

const lessonTypes = {
  video: { icon: Play, label: 'فيديو', color: 'text-red-500' },
  quiz: { icon: HelpCircle, label: 'كويز', color: 'text-purple-500' },
  external: { icon: ExternalLink, label: 'رابط خارجي', color: 'text-blue-500' },
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-600' },
  survey: { icon: FileCheck, label: 'استبيان', color: 'text-green-500' },
  title: { icon: BookOpen, label: 'عنوان', color: 'text-gray-500' },
  certificate: { icon: Award, label: 'شهادة', color: 'text-amber-500' },
  exercise: { icon: CheckSquare, label: 'تمرين', color: 'text-indigo-500' },
  audio: { icon: Headphones, label: 'صوتي', color: 'text-pink-500' },
  checklist: { icon: CheckCircle2, label: 'قائمة', color: 'text-teal-500' }
}

const mockLessons = [
  { id: 1, title: 'مقدمة React', type: 'video', duration: '15:30', section: 'الأساسيات', completed: true },
  { id: 2, title: 'مراجعة الدرس الأول', type: 'quiz', duration: '10:00', section: 'الأساسيات', completed: false },
  { id: 3, title: 'دليل المراجع', type: 'pdf', duration: '-', section: 'الأساسيات', completed: false },
  { id: 4, title: 'مصادر إضافية', type: 'external', duration: '-', section: 'الأساسيات', completed: false },
  { id: 5, title: 'استبيان رضا', type: 'survey', duration: '5:00', section: 'الأساسيات', completed: false },
  { id: 6, title: 'الجزء الثاني', type: 'title', duration: '-', section: 'التطبيقات العملية', completed: false },
  { id: 7, title: 'بناء أول تطبيق', type: 'video', duration: '22:15', section: 'التطبيقات العملية', completed: false },
  { id: 8, title: 'تمرين عملي', type: 'exercise', duration: '30:00', section: 'التطبيقات العملية', completed: false },
  { id: 9, title: 'شرح صوتي', type: 'audio', duration: '12:45', section: 'التطبيقات العملية', completed: false },
  { id: 10, title: 'قائمة المهام', type: 'checklist', duration: '-', section: 'التطبيقات العملية', completed: false },
  { id: 11, title: 'شهادة الإتمام', type: 'certificate', duration: '-', section: 'التطبيقات العملية', completed: false }
]

function formatPrice (price: number) {
  return `${price.toLocaleString()} د.ج`
}

function getIntroVideoUrl (course: { title: string, category: string }) {
  if (course.title.includes('React')) {
    return 'https://www.youtube-nocookie.com/embed/ihRRf3EjTV8'
  }
  if (course.title.includes('Node') || course.category === 'برمجة' && course.title.includes('Node')) {
    return 'https://www.youtube-nocookie.com/embed/Y-p5bOmTz8I'
  }
  if (course.category === 'تصميم' || course.title.includes('واجهات')) {
    return 'https://www.youtube-nocookie.com/embed/MJDPFYe_0g0'
  }
  if (course.category === 'لغات' || course.title.includes('الإنجليزية')) {
    return 'https://www.youtube-nocookie.com/embed/859Qcx_XPyA'
  }
  return 'https://www.youtube-nocookie.com/embed/ihRRf3EjTV8'
}

export default function CoursePage () {
  const params = useParams()
  const idStr = (params?.id as string) || '1'
  const id = Number.parseInt(idStr, 10)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ 'الأساسيات': true })

  const course = useMemo(() => {
    const found = mockCourses.find(c => c.id === (Number.isFinite(id) ? id : 1))
    return found ?? mockCourses[0]
  }, [id])

  const introUrl = getIntroVideoUrl(course)
  const sections = Array.from(new Set(mockLessons.map(l => l.section)))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <main className='bg-white pt-20 sm:pt-24 md:pt-28 lg:pt-24' dir='rtl'>
      {/* Hero */}
      <section className='relative bg-gradient-to-b from-amber-50/30 via-white to-white pb-8'>
        <div className='absolute inset-0 opacity-[0.02]' 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
            backgroundSize: '40px 40px'
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
                <span className='flex items-center gap-1.5'>
                  <svg className='w-5 h-5 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <span className='font-semibold text-gray-900'>{course.rating}</span>
                </span>
                <span>•</span>
                <span>{course.students.toLocaleString()} طالب</span>
                <span>•</span>
                <span>{course.level}</span>
              </div>

              <div className='mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-200'>
                <Image
                  className='w-full h-auto object-cover'
                  src={course.image}
                  alt={course.title}
                  width={1200}
                  height={600}
                />
              </div>

              {/* Intro video */}
              <div className='rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg'>
                <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className='absolute top-0 left-0 w-full h-full'
                    src={`${introUrl}?rel=0&modestbranding=1&playsinline=1`}
                    title={`Intro - ${course.title}`}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    referrerPolicy='strict-origin-when-cross-origin'
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className='lg:col-span-4'>
              <div className='sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-3xl font-black text-gray-900'>{formatPrice(course.price)}</span>
                  {course.price > 2000 && (
                    <span className='text-sm text-gray-500 line-through'>
                      {Math.round(course.price * 1.3).toLocaleString()} د.ج
                    </span>
                  )}
                </div>
                <button className='w-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white py-3 font-bold shadow-[0_10px_25px_rgba(217,119,6,0.45)] hover:brightness-105 transition-all mb-4'>
                  اشترك الآن
                </button>
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

      {/* Content */}
      <section className='py-10 sm:py-14'>
        <div className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-8'>
              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm bg-white'
              >
                <h2 className='text-xl font-bold text-gray-900 mb-4'>نبذة عن الدورة</h2>
                <p className='text-sm leading-7 text-gray-700'>هذه الصفحة تعرض تفاصيل دورة "{course.title}" مع معلومات شاملة عن المحتوى، الأهداف، والمتطلبات. البيانات هنا تجريبية لعرض التصميم.</p>
              </motion.div>

              {/* What you'll learn */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm bg-white'
              >
                <h2 className='text-xl font-bold text-gray-900 mb-4'>ستتعلّم</h2>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {[`مبادئ ${course.category}`, 'تطبيق عملي خطوة بخطوة', 'أفضل الممارسات', 'بناء مشروع مصغّر'].map((item, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm text-gray-700'>
                      <CheckCircle2 className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Curriculum with Icons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='rounded-2xl border border-gray-200 p-6 shadow-sm bg-white'
              >
                <h2 className='text-xl font-bold text-gray-900 mb-4'>المنهج</h2>
                <div className='space-y-4'>
                  {sections.map((section, idx) => {
                    const sectionLessons = mockLessons.filter(l => l.section === section)
                    const isExpanded = expandedSections[section]
                    return (
                      <div key={idx} className='rounded-xl border border-gray-200 overflow-hidden'>
                        <button
                          onClick={() => toggleSection(section)}
                          className='w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-white text-right flex items-center justify-between hover:from-gray-100 transition-all'
                        >
                          <span className='text-base font-bold text-gray-900'>{section}</span>
                          <span className='text-sm text-gray-600'>
                            {sectionLessons.length} درس
                            <span className={`inline-block mr-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </span>
                        </button>
                        {isExpanded && (
                          <ul className='divide-y divide-gray-100 bg-white'>
                            {sectionLessons.map((lesson) => {
                              const TypeIcon = lessonTypes[lesson.type as keyof typeof lessonTypes]?.icon || BookOpen
                              const typeInfo = lessonTypes[lesson.type as keyof typeof lessonTypes] || { color: 'text-gray-500', label: lesson.type }
                              return (
                                <li key={lesson.id} className='px-5 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors group'>
                                  <div className='flex items-center gap-3 flex-1'>
                                    <TypeIcon className={`w-5 h-5 ${typeInfo.color} flex-shrink-0`} />
                                    <div className='flex-1 text-right'>
                                      <span className='text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors'>{lesson.title}</span>
                                      <span className='text-xs text-gray-500 mr-2'>({typeInfo.label})</span>
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-3'>
                                    {lesson.completed && (
                                      <CheckCircle2 className='w-5 h-5 text-green-500' />
                                    )}
                                    <span className='text-xs text-gray-500'>{lesson.duration}</span>
                                  </div>
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

              {/* Q&A Section */}
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
                <div className='space-y-4'>
                  {/* Q&A item */}
                  <div className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-start gap-3'>
                      <Image 
                        src='https://i.pravatar.cc/40?img=1' 
                        alt='User' 
                        width={40} 
                        height={40} 
                        className='rounded-full flex-shrink-0'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-sm font-semibold text-gray-900'>أحمد محمد</span>
                          <span className='text-xs text-gray-500'>منذ يومين</span>
                        </div>
                        <p className='text-sm text-gray-700 mb-2'>كيف يمكنني تطبيق ما تعلمته في الدرس الأول؟</p>
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                          <Mic className='w-4 h-4' />
                          <span>رد صوتي متاح</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Answer */}
                  <div className='border border-amber-200 bg-amber-50/30 rounded-lg p-4 mr-4'>
                    <div className='flex items-start gap-3'>
                      <div className='w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0'>
                        {course.instructor[0]}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-sm font-semibold text-gray-900'>{course.instructor}</span>
                          <span className='text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full'>المدرس</span>
                        </div>
                        <p className='text-sm text-gray-700'>يمكنك البدء بمشروع صغير يطبق المبادئ الأساسية...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button className='mt-4 w-full py-2.5 text-sm font-semibold text-amber-600 border-2 border-amber-300 rounded-lg hover:bg-amber-50 transition-colors'>
                  طرح سؤال جديد
                </button>
              </motion.div>
            </div>

            {/* Instructor */}
            <aside className='lg:col-span-4'>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='rounded-2xl border border-gray-200 p-6 shadow-sm bg-white'
              >
                <h3 className='text-lg font-bold text-gray-900 mb-4'>عن المدرّس</h3>
                <div className='flex items-center gap-3 mb-4'>
                  <Image 
                    className='w-16 h-16 rounded-full object-cover border-2 border-amber-200' 
                    src='https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=face' 
                    alt={course.instructor} 
                    width={64} 
                    height={64} 
                  />
                  <div>
                    <p className='text-base font-bold text-gray-900 flex items-center gap-2'>
                      {course.instructor}
                      {course.verified && (
                        <svg className='w-5 h-5 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                      )}
                    </p>
                    <p className='text-xs text-gray-600 mt-1'>{course.language}</p>
                  </div>
                </div>
                <p className='text-sm text-gray-700 leading-7'>مدرّس ذو خبرة عملية في {course.category}، قدّم عشرات الساعات من المحتوى التعليمي ودعم مئات الطلاب لتحقيق نتائج ملحوظة.</p>
              </motion.div>
            </aside>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-10 sm:py-14 bg-gradient-to-b from-gray-50 to-white'>
        <div className='px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
          <div className='text-center mb-10'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>
              آراء <GradientText text='المتعلمين' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h2>
            <p className='text-gray-600'>مقتطفات من تعليقات حقيقية حول محتوى الدورة وجودته</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className='flex flex-col overflow-hidden shadow-lg bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow'
              >
                <div className='flex flex-col justify-between flex-1 p-6'>
                  <div className='flex items-center justify-end gap-1 mb-4'>
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className='w-5 h-5 text-amber-400' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    ))}
                  </div>
                  <blockquote className='mb-6'>
                    <p className='text-sm leading-7 text-gray-900 text-right'>
                      محتوى منظم وواضح جدًا. ساعدتني هذه الدورة على فهم {course.category} بشكل عملي وبناء مشروع حقيقي.
                    </p>
                  </blockquote>
                  <div className='flex items-center'>
                    <Image
                      className='flex-shrink-0 object-cover rounded-full w-12 h-12 border-2 border-amber-200'
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt='Avatar'
                      width={48}
                      height={48}
                    />
                    <div className='mr-3'>
                      <p className='text-sm font-bold text-gray-900'>{i === 1 ? 'فاطمة' : i === 2 ? 'يوسف' : 'مريم'}</p>
                      <p className='mt-0.5 text-xs text-gray-600'>متعلم/ـة في {course.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended courses */}
      <PopularCourses />
    </main>
  )
}
