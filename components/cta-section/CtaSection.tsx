'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'

export function CtaSection () {
  return (
    <section className='bg-gray-50'>
      <div className='px-4 py-10 mx-auto sm:px-6  lg:px-8'>
        <div className='relative rounded-3xl p-[2px] m-[10px] lg:m-[20px] bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'>
          <div className='relative bg-white rounded-3xl p-8 sm:p-12 lg:p-16 xl:p-20'>
          <div className='relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
            <motion.div
              className='lg:w-1/2 lg:order-2'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <p className='text-sm font-normal tracking-widest text-gray-600 uppercase text-right'>
                منصة تعليمية شاملة للمتعلمين والمحترفين
              </p>
              <h2 className='mt-2 sm:mt-6 text-[22px] font-bold text-yellow-500 sm:text-5xl lg:text-6xl xl:text-7xl text-right'>
                ابدأ رحلتك التعليمية الآن
              </h2>
              <p className='max-w-lg mt-2 sm:mt-4 text-xl font-normal text-gray-700 sm:mt-8 text-right'>
                انضم إلى آلاف المتعلمين الذين يحولون شغفهم إلى مهارات حقيقية ومصدر دخل مستدام. ابدأ اليوم واصنع مستقبلك المهني.
              </p>

              <motion.div
                className='relative inline-flex items-center justify-center mt-8 sm:mt-12 group'
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className='absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:shadow-lg group-hover:shadow-yellow-500/50' />
                <Link
                  href='#'
                  title=''
                  className='relative inline-flex items-center justify-center px-8 py-3 text-base font-normal text-white  border border-transparent rounded-full'
                  role='button'
                >
                  ابدأ التعلم الآن
                </Link>
              </motion.div>

              <div>
                <div className='inline-flex items-center pt-6 mt-8 border-t border-gray-300 sm:pt-10 sm:mt-14'>
                  <svg
                    className='w-6 h-6 rotate-180'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeWidth='1.5'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M13 7.00003H21M21 7.00003V15M21 7.00003L13 15L9 11L3 17'
                      stroke='url(#cta-gradient)'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <defs>
                      <linearGradient id='cta-gradient' x1='3' y1='7.00003' x2='22.2956' y2='12.0274' gradientUnits='userSpaceOnUse'>
                        <stop offset='0%' stopColor='#fbbf24' />
                        <stop offset='100%' stopColor='#d97706' />
                      </linearGradient>
                    </defs>
                  </svg>

                  <span className='mr-2 text-base font-normal text-gray-700 text-right'>
                    تم إضافة 42 دورة جديدة الأسبوع الماضي
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className='lg:w-1/2 lg:order-1 lg:flex lg:justify-center pointer-events-none'
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.div
                className='relative w-full max-w-xs mx-auto lg:max-w-sm xl:max-w-md'
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                  <Image
                    className='w-full h-auto'
                    src='/gril from tablet with bg .png'
                    alt='3D Girl with Certificate'
                    width={400}
                    height={600}
                  />
              </motion.div>
            </motion.div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}

