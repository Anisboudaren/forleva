'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function Header () {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function toggleMenu () {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='bg-[#FCF8F1] bg-opacity-30'>
      <div className='px-4 mx-auto sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 lg:h-20'>
          <button
            type='button'
            className='inline-flex p-2 text-black transition-all duration-200 rounded-md lg:hidden focus:bg-gray-100 hover:bg-gray-100 order-1'
            onClick={toggleMenu}
            aria-label='تبديل القائمة'
          >
            {isMenuOpen ? (
              <svg
                className='block w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            ) : (
              <svg
                className='block w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 8h16M4 16h16'
                />
              </svg>
            )}
          </button>

          <div className='hidden lg:flex lg:items-center lg:justify-center lg:space-x-reverse lg:space-x-10 order-2'>
            <Link
              href='#'
              title=''
              className='text-base text-black transition-all duration-200 hover:text-opacity-80'
            >
              المميزات
            </Link>

            <Link
              href='#'
              title=''
              className='text-base text-black transition-all duration-200 hover:text-opacity-80'
            >
              الحلول
            </Link>

            <Link
              href='#'
              title=''
              className='text-base text-black transition-all duration-200 hover:text-opacity-80'
            >
              الموارد
            </Link>

            <Link
              href='#'
              title=''
              className='text-base text-black transition-all duration-200 hover:text-opacity-80'
            >
              الأسعار
            </Link>
          </div>

          <div className='flex-shrink-0 order-3'>
            <Link href='/' title='Forleva' className='flex items-center'>
              <Image
                className='w-auto h-8'
                src='/Untitled (2000 x 800 px).png'
                alt='Forleva Logo'
                width={200}
                height={80}
              />
            </Link>
          </div>

          <Link
            href='#'
            title=''
            className='hidden lg:inline-flex items-center justify-center px-5 py-2.5 text-base transition-all duration-200 hover:bg-yellow-300 hover:text-black focus:text-black focus:bg-yellow-300 font-semibold text-white bg-black rounded-full order-4'
            role='button'
          >
            انضم الآن
          </Link>
        </div>

        {isMenuOpen && (
          <div className='lg:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              <Link
                href='#'
                title=''
                className='block px-3 py-2 text-base text-black transition-all duration-200 hover:text-opacity-80'
                onClick={() => setIsMenuOpen(false)}
              >
                المميزات
              </Link>

              <Link
                href='#'
                title=''
                className='block px-3 py-2 text-base text-black transition-all duration-200 hover:text-opacity-80'
                onClick={() => setIsMenuOpen(false)}
              >
                الحلول
              </Link>

              <Link
                href='#'
                title=''
                className='block px-3 py-2 text-base text-black transition-all duration-200 hover:text-opacity-80'
                onClick={() => setIsMenuOpen(false)}
              >
                الموارد
              </Link>

              <Link
                href='#'
                title=''
                className='block px-3 py-2 text-base text-black transition-all duration-200 hover:text-opacity-80'
                onClick={() => setIsMenuOpen(false)}
              >
                الأسعار
              </Link>

              <Link
                href='#'
                title=''
                className='block px-3 py-2 mt-4 text-base text-center transition-all duration-200 hover:bg-yellow-300 hover:text-black focus:text-black focus:bg-yellow-300 font-semibold text-white bg-black rounded-full'
                role='button'
                onClick={() => setIsMenuOpen(false)}
              >
                انضم الآن
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

