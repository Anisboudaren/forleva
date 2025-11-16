import Link from 'next/link'
import Image from 'next/image'

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

function formatPrice (price: number) {
  return `${price.toLocaleString()} د.ج`
}

export default function CoursesByCategoryPage ({ params }: { params: { category: string } }) {
  const rawParam = params.category || ''
  const decoded = decodeURIComponent(rawParam).trim()
  const normalize = (s: string) => s.replace(/^ال/, '').trim()
  const categoryParam = normalize(decoded) || 'all'

  const categories = Array.from(new Set(mockCourses.map(c => c.category)))

  const filtered = categoryParam && categoryParam !== 'all'
    ? mockCourses.filter(c => normalize(c.category) === categoryParam)
    : mockCourses

  return (
    <main className='bg-white'>
      <section className='py-10 sm:py-14'>
        <div className='px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 text-right'>الدورات</h1>
              {categoryParam && categoryParam !== 'all' && (
                <p className='mt-1 text-sm text-gray-600 text-right'>تُعرض الآن فئة: {decoded}</p>
              )}
            </div>

            <div className='flex flex-wrap gap-2 justify-end'>
              <Link href='/courses/category/all' className={`px-3 py-1.5 rounded-full text-sm border ${(!categoryParam || categoryParam === 'all') ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                الكل
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat}
                  href={`/courses/category/${encodeURIComponent(cat)}`}
                  className={`px-3 py-1.5 rounded-full text-sm border ${categoryParam === normalize(cat) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filtered.map(course => (
              <div key={course.id} className='relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow group rounded-xl hover:shadow-lg hover:-translate-y-1'>
                <Link href={`/courses/${course.id}`} className='flex shrink-0 aspect-w-4 aspect-h-3 relative'>
                  <Image
                    className='object-cover w-full h-full transition-all duration-200 transform group-hover:scale-110'
                    src={course.image}
                    alt={course.title}
                    width={320}
                    height={240}
                  />
                  {course.recommended && (
                    <div className='absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full'>
                      موصى به
                    </div>
                  )}
                </Link>
                <div className='flex-1 px-4 py-5 sm:p-6 flex flex-col'>
                  <div className='mb-2'>
                    <span className='text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                      {course.category}
                    </span>
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <p className='text-lg font-bold text-gray-900 text-right'>{course.title}</p>
                    <p className='mt-2 text-sm text-gray-600 text-right'>{course.instructor}</p>
                  </Link>
                </div>
                <div className='px-4 py-5 mt-auto border-t border-gray-100 sm:px-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xl font-bold text-gray-900'>{formatPrice(course.price)}</span>
                    <Link href={`/courses/${course.id}`} className='text-sm font-semibold text-gray-900 hover:text-gray-600'>
                      عرض التفاصيل →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
