'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

function formatPrice (price: number) {
  return `${price.toLocaleString()} د.ج`
}

function getIntroVideoUrl (course: { title: string, category: string }) {
  // Map specific courses/categories to provided YouTube intros (embed, no-cookie)
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
  // Fallback/reuse
  return 'https://www.youtube-nocookie.com/embed/ihRRf3EjTV8'
}

export default function CoursePage () {
  const params = useParams()
  const idStr = (params?.id as string) || '1'
  const id = Number.parseInt(idStr, 10)
  const course = useMemo(() => {
    const found = mockCourses.find(c => c.id === (Number.isFinite(id) ? id : 1))
    return found ?? mockCourses[0]
  }, [id])

  const introUrl = getIntroVideoUrl(course)

  return (
    <main className='bg-white'>
      {/* Hero */}
      <section className='bg-gray-50'>
        <div className='px-[10px] lg:px-[20px] py-8 lg:py-12'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto'>
            <div className='lg:col-span-8'>
              <nav className='text-sm text-gray-500 mb-3'>
                <Link href='/' className='hover:text-gray-700'>الرئيسية</Link>
                <span className='mx-2'>/</span>
                <Link href='/' className='hover:text-gray-700'>الدورات</Link>
                <span className='mx-2'>/</span>
                <span className='text-gray-900'>{course.title}</span>
              </nav>
              <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>{course.title}</h1>
              <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600'>
                <span className='flex items-center gap-1'>
                  <span className='text-yellow-500'>★</span>
                  {course.rating}
                </span>
                <span>•</span>
                <span>{course.students.toLocaleString()} طالب</span>
                <span>•</span>
                <span>{course.level}</span>
                <span>•</span>
                <span>آخر تحديث: {course.lastUpdated}</span>
              </div>
              <div className='mt-6'>
                <Image
                  className='w-full h-auto rounded-2xl object-cover'
                  src={course.image}
                  alt={course.title}
                  width={1200}
                  height={600}
                />
              </div>

              {/* Intro video */}
              <div className='mt-6 rounded-2xl overflow-hidden border border-gray-200'>
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
              <div className='sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-2xl font-bold text-gray-900'>{formatPrice(course.price)}</span>
                  <span className='text-sm text-gray-500'>({course.duration})</span>
                </div>
                <button className='mt-4 w-full rounded-xl bg-gray-900 text-white py-3 font-bold hover:opacity-90 transition'>اشترك الآن</button>
                <ul className='mt-5 space-y-2 text-sm text-gray-700'>
                  <li className='flex items-center gap-2'>
                    <span className='text-green-600'>✓</span>
                    وصول مدى الحياة
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-green-600'>✓</span>
                    شهادة إتمام
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-green-600'>✓</span>
                    تحديثات مجانية للمحتوى
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className='px-[10px] lg:px-[20px] py-10 lg:py-14'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto'>
            <div className='lg:col-span-8'>
              {/* Description */}
              <div className='rounded-2xl border border-gray-200 p-6 mb-6'>
                <h2 className='text-lg font-bold text-gray-900 mb-3'>نبذة عن الدورة</h2>
                <p className='text-sm leading-7 text-gray-700'>هذه الصفحة تعرض تفاصيل دورة "{course.title}" مع معلومات شاملة عن المحتوى، الأهداف، والمتطلبات. البيانات هنا تجريبية لعرض التصميم.</p>
              </div>

              {/* What you'll learn */}
              <div className='rounded-2xl border border-gray-200 p-6 mb-6'>
                <h2 className='text-lg font-bold text-gray-900 mb-3'>ستتعلّم</h2>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {[`مبادئ ${course.category}`, 'تطبيق عملي خطوة بخطوة', 'أفضل الممارسات', 'بناء مشروع مصغّر'].map((item, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm text-gray-700'>
                      <span className='text-gray-900 mt-0.5'>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum (mock) */}
              <div className='rounded-2xl border border-gray-200 p-6'>
                <h2 className='text-lg font-bold text-gray-900 mb-3'>المنهج</h2>
                <div className='space-y-4'>
                  {['الأساسيات', 'التطبيقات العملية'].map((section, idx) => (
                    <div key={idx} className='rounded-xl border border-gray-100'>
                      <div className='px-4 py-3 bg-gray-50 rounded-t-xl text-sm font-semibold text-gray-900'>
                        {section}
                      </div>
                      <ul className='divide-y divide-gray-100'>
                        {['مقدمة', 'تهيئة المشروع', 'أول تطبيق', 'مراجعة'].map((lec, j) => (
                          <li key={j} className='px-4 py-3 flex items-center justify-between text-sm text-gray-700'>
                            <span className='truncate'>{lec}</span>
                            <span className='text-gray-500'>10:0{(j + 1) % 5}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructor (mock) */}
            <aside className='lg:col-span-4'>
              <div className='rounded-2xl border border-gray-200 p-6'>
                <h3 className='text-base font-bold text-gray-900 mb-4'>عن المدرّس</h3>
                <div className='flex items-center gap-3'>
                  <Image className='w-14 h-14 rounded-full object-cover' src='https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=face' alt={course.instructor} width={56} height={56} />
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>{course.instructor} {course.verified && (
                      <span className='text-blue-500 align-middle ml-1'>✔︎</span>
                    )}</p>
                    <p className='text-xs text-gray-600'>اللغة: {course.language}</p>
                  </div>
                </div>
                <p className='mt-4 text-sm text-gray-700 leading-7'>مدرّس ذو خبرة عملية في {course.category}، قدّم عشرات الساعات من المحتوى التعليمي ودعم مئات الطلاب لتحقيق نتائج ملحوظة.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
