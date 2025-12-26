import Link from 'next/link'
import Image from 'next/image'

export function Hero () {
  return (
    <section className='bg-[#FCF8F1] bg-opacity-30 py-10 sm:py-16 lg:py-24'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='grid items-center grid-cols-1 gap-12 lg:grid-cols-2'>
          <div className='order-1 lg:order-2'>
            <Image
              className='w-full animate-slide-in-left opacity-0'
              src='https://cdn.rareblocks.xyz/collection/celebration/images/hero/1/hero-img.png'
              alt='صورة توضيحية'
              width={800}
              height={600}
              priority
            />
          </div>

          <div className='order-2 lg:order-1 animate-fade-in-up opacity-0'>
            <p className='text-base font-semibold tracking-wider text-blue-600 uppercase'>
              منصة تعليمية اجتماعية للمتعلمين
            </p>

            <h1 className='mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-6xl xl:text-8xl'>
              تواصل وتعلم من الخبراء
            </h1>

            <p className='mt-4 text-base text-black lg:mt-8 sm:text-xl'>
              نمّي مسيرتك المهنية بسرعة مع المرشد المناسب.
            </p>

            <Link
              href='#'
              title=''
              className='inline-flex items-center px-6 py-4 mt-8 font-semibold text-black transition-all duration-200 bg-yellow-300 rounded-full lg:mt-16 hover:bg-yellow-400 focus:bg-yellow-400'
              role='button'
            >
              انضم مجاناً
              <svg
                className='w-6 h-6 mr-8 -ml-2 rotate-180'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d='M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </Link>

            <p className='mt-5 text-gray-600'>
              انضممت بالفعل؟{' '}
              <Link
                href='#'
                title=''
                className='text-black transition-all duration-200 hover:underline'
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

