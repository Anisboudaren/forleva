'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'

export function Header2 () {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function toggleMenu () {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='relative py-4 md:py-6'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='relative flex items-center justify-between gap-4'>
          <div className='hidden lg:absolute lg:inset-y-0 lg:flex lg:items-center lg:justify-center lg:w-full lg:pointer-events-none'>
            <div className='flex items-center gap-6 lg:gap-8 pointer-events-auto'>
              <Link
                href='#'
                title=''
                className='text-sm lg:text-base font-medium text-gray-900 transition-all duration-200 rounded px-2 py-1 focus:outline-none hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 whitespace-nowrap'
              >
                من نحن
              </Link>

              <Link
                href='#'
                title=''
                className='text-sm lg:text-base font-medium text-gray-900 transition-all duration-200 rounded px-2 py-1 focus:outline-none hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 whitespace-nowrap'
              >
                كيف يعمل
              </Link>

              <Link
                href='#'
                title=''
                className='text-sm lg:text-base font-medium text-gray-900 transition-all duration-200 rounded px-2 py-1 focus:outline-none hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 whitespace-nowrap'
              >
                الدورات
              </Link>
            </div>
          </div>

          <div className='hidden lg:flex lg:items-center lg:gap-3 lg:ml-auto'>
            <Link
              href='/login'
              title=''
              className='text-sm lg:text-base font-medium text-gray-900 transition-all duration-200 rounded px-3 py-2 focus:outline-none hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 whitespace-nowrap'
            >
              تسجيل الدخول
            </Link>
          </div>

          <div className='flex lg:hidden'>
            <button
              type='button'
              className='text-gray-900 transition-transform duration-200'
              onClick={toggleMenu}
              aria-label='تبديل القائمة'
            >
              {isMenuOpen ? (
                <svg
                  className='w-7 h-7'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.5'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              ) : (
                <svg
                  className='w-7 h-7'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.5'
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              )}
            </button>
          </div>

          <div className='flex-shrink-0 order-last'>
            <Link
              href='/'
              title='Forleva'
              className='flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2'
            >
              <Image
                className='w-auto h-12 lg:h-16'
                src='/logo with brand name (black colored ).png'
                alt='Forleva Logo'
                width={300}
                height={120}
              />
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='lg:hidden mt-4 overflow-hidden'
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='flex flex-col space-y-3'
              >
                <Link
                  href='#'
                  title=''
                  className='text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none hover:text-opacity-50'
                  onClick={() => setIsMenuOpen(false)}
                >
                  من نحن
                </Link>

                <Link
                  href='#'
                  title=''
                  className='text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none hover:text-opacity-50'
                  onClick={() => setIsMenuOpen(false)}
                >
                  كيف يعمل
                </Link>

                <Link
                  href='#'
                  title=''
                  className='text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none hover:text-opacity-50'
                  onClick={() => setIsMenuOpen(false)}
                >
                  الدورات
                </Link>

                <Link
                  href='/login'
                  title=''
                  className='text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none hover:text-opacity-50'
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

