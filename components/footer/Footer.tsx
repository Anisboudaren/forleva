import Link from 'next/link'
import Image from 'next/image'

export function Footer () {
  return (
    <footer className='bg-gray-900 text-gray-300'>
      <div className='px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-16'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          <div>
            <Link href='/' className='flex mb-4'>
              <Image
                className='w-auto h-8 brightness-0 invert'
                src='/Untitled (2000 x 800 px).png'
                alt='Forleva Logo'
                width={200}
                height={80}
              />
            </Link>
            <p className='text-sm text-gray-400 leading-relaxed'>
              منصة تعليمية شاملة ترافقك من التعلم إلى الاحتراف وتحقيق الدخل
            </p>
          </div>

          <div>
            <h3 className='text-base font-semibold text-white mb-4'>روابط سريعة</h3>
            <ul className='space-y-3'>
              <li>
                <Link href='/' className='text-sm hover:text-white transition-colors'>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href='/courses' className='text-sm hover:text-white transition-colors'>
                  جميع الدورات
                </Link>
              </li>
              <li>
                <Link href='/about' className='text-sm hover:text-white transition-colors'>
                  من نحن
                </Link>
              </li>
              <li>
                <Link href='/how-it-works' className='text-sm hover:text-white transition-colors'>
                  كيف يعمل
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-base font-semibold text-white mb-4'>الدعم</h3>
            <ul className='space-y-3'>
              <li>
                <Link href='/help' className='text-sm hover:text-white transition-colors'>
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href='/contact' className='text-sm hover:text-white transition-colors'>
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href='/faq' className='text-sm hover:text-white transition-colors'>
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href='/privacy' className='text-sm hover:text-white transition-colors'>
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-base font-semibold text-white mb-4'>تابعنا</h3>
            <ul className='space-y-3'>
              <li>
                <Link href='#' className='text-sm hover:text-white transition-colors'>
                  فيسبوك
                </Link>
              </li>
              <li>
                <Link href='#' className='text-sm hover:text-white transition-colors'>
                  تويتر
                </Link>
              </li>
              <li>
                <Link href='#' className='text-sm hover:text-white transition-colors'>
                  إنستغرام
                </Link>
              </li>
              <li>
                <Link href='#' className='text-sm hover:text-white transition-colors'>
                  لينكد إن
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='pt-8 mt-8 border-t border-gray-800'>
          <div className='flex flex-col items-center justify-between md:flex-row'>
            <p className='text-sm text-gray-400 text-center md:text-right'>
              © {new Date().getFullYear()} Forleva. جميع الحقوق محفوظة.
            </p>
            <div className='flex items-center gap-6 mt-4 md:mt-0'>
              <Link href='/terms' className='text-sm text-gray-400 hover:text-white transition-colors'>
                الشروط والأحكام
              </Link>
              <Link href='/cookies' className='text-sm text-gray-400 hover:text-white transition-colors'>
                سياسة الكوكيز
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

