import Link from 'next/link'
import Image from 'next/image'

export function Footer () {
  return (
    <footer className='relative bg-black text-gray-300 overflow-hidden' dir='rtl'>
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black via-black to-gray-900/50 pointer-events-none' />
      
      {/* Gold texture on the left - triangles and dots */}
      <div className='absolute left-0 top-0 bottom-0 w-1/4 lg:w-1/3 pointer-events-none'>
        {/* Dots pattern */}
        <div 
          className='absolute inset-0 opacity-8'
          style={{
            backgroundImage: `
              radial-gradient(circle, #fbbf24 1.5px, transparent 1.5px),
              radial-gradient(circle, #f59e0b 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 60px 60px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />
        {/* Triangles pattern */}
        <svg 
          className='absolute inset-0 w-full h-full opacity-12'
          style={{ mixBlendMode: 'overlay' }}
        >
          <defs>
            <pattern id="triangles" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon 
                points="30,0 60,52 0,52" 
                fill="none" 
                stroke="#fbbf24" 
                strokeWidth="0.8"
              />
              <polygon 
                points="15,26 45,78 -15,78" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#triangles)" />
        </svg>
      </div>
      
      <div className='relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-20'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-4 mb-16'>
          {/* Logo and Description */}
          <div className='lg:col-span-1'>
            <Link href='/' className='inline-flex mb-6 transition-opacity hover:opacity-80'>
              <Image
                className='w-auto h-16'
                src='/logo but white.png'
                alt='Forleva Logo'
                width={300}
                height={120}
              />
            </Link>
            <p className='text-sm leading-relaxed text-gray-400 max-w-xs'>
              أول منصّة تعليمية شاملة ترافقك من التعلّم إلى الاحتراف وتحويل مهاراتك إلى دخل حقيقي.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-base font-bold text-white mb-6 tracking-tight'>
              روابط سريعة
            </h3>
            <ul className='space-y-4'>
              <li>
                <Link href='/' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href='/courses' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  جميع الدورات
                </Link>
              </li>
              <li>
                <Link href='/about' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  من نحن
                </Link>
              </li>
              <li>
                <Link href='/how-it-works' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  كيف يعمل
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='text-base font-bold text-white mb-6 tracking-tight'>
              الدعم
            </h3>
            <ul className='space-y-4'>
              <li>
                <Link href='/help' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href='/contact' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href='/faq' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href='/privacy' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 inline-block'>
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className='text-base font-bold text-white mb-6 tracking-tight'>
              تابعنا
            </h3>
            <div className='flex items-center gap-4'>
              <Link 
                href='https://facebook.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-all duration-200'
                aria-label='Facebook'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path fillRule='evenodd' d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' clipRule='evenodd' />
                </svg>
              </Link>
              <Link 
                href='https://youtube.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-all duration-200'
                aria-label='YouTube'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path fillRule='evenodd' d='M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z' clipRule='evenodd' />
                </svg>
              </Link>
              <Link 
                href='https://wa.me' 
                target='_blank' 
                rel='noopener noreferrer'
                className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-all duration-200'
                aria-label='WhatsApp'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='pt-8 border-t border-gray-800/50'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <p className='text-sm text-gray-500 text-center md:text-right'>
              © {new Date().getFullYear()} Forleva. جميع الحقوق محفوظة.
            </p>
            <div className='flex items-center gap-6'>
              <Link href='/terms' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200'>
                الشروط والأحكام
              </Link>
              <Link href='/cookies' className='text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200'>
                سياسة الكوكيز
              </Link>
            </div>
          </div>
          <div className='mt-6 text-center'>
            <p className='text-xs text-gray-600'>Powered by Devlly</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

