'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'

export function Hero2SplitLayout () {
  return (
    <section className='relative py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-amber-100 via-white to-amber-50'>
      <div className='absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-amber-200/60 via-amber-300/40 to-amber-100/0 lg:block' />

      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
          <motion.div
            className='space-y-6 text-right order-2 lg:order-1'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className='inline-flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-2'>
              <div className='h-7 w-7 rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center shadow-[0_0_0_4px_rgba(253,230,138,0.7)]'>
                <span className='text-lg'>✨</span>
              </div>
              <p className='text-sm font-medium text-amber-900'>
                شعارنا: صدّق... توصل
              </p>
            </div>

            <h1 className='text-3xl font-bold leading-tight text-gray-900 sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight'>
              أول منصّة ترافقك من التعلّم إلى الاحتراف و
              <GradientText text='تحقيق الدخل' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h1>

            <p className='text-base leading-7 text-gray-600 max-w-lg ml-auto'>
              دورات أونلاين في مجالات متنوّعة، نعلّمك خطوة بخطوة حتى تحوّل مهارتك إلى مصدر دخل حقيقي
            </p>

            <div className='flex flex-wrap items-center gap-4 justify-start lg:justify-end'>
              <Link
                href='#'
                title=''
                className='inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-3 text-sm font-semibold text-amber-950 shadow-[0_15px_40px_rgba(245,158,11,0.45)] transition-all hover:bg-amber-500 hover:-translate-y-0.5'
                role='button'
              >
                ابدأ رحلتك الآن
              </Link>

              <button
                type='button'
                className='inline-flex items-center gap-2 text-sm font-medium text-amber-900/80 hover:text-amber-900'
              >
                <span>اكتشف كيف نرافقك خطوة بخطوة</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            className='relative order-1 lg:order-2'
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <div className='relative mx-auto max-w-md'>
              <div className='absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-500 opacity-70 blur-2xl' />

              <div className='relative rounded-[2.5rem] border border-amber-100/70 bg-white/95 p-5 shadow-[0_25px_70px_rgba(180,83,9,0.22)]'>
                <div className='flex items-center justify-between gap-4 mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100'>
                      <Image
                        src='/logo with brand name (black colored ).png'
                        alt='Forleva Logo'
                        width={80}
                        height={40}
                        className='h-8 w-auto'
                      />
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-gray-500'>منصّة التعليم و تحقيق الدخل</p>
                      <p className='text-sm font-semibold text-gray-900'>Forleva</p>
                    </div>
                  </div>
                  <span className='rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900'>
                    LIVE
                  </span>
                </div>

                <div className='relative overflow-hidden rounded-2xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500'>
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(252,211,77,0.45),transparent_55%)]' />
                  <div className='relative p-5 text-right text-amber-950'>
                    <p className='text-sm font-semibold mb-1'>ابدأ اليوم</p>
                    <p className='text-xs'>
                      حوّل مهارتك إلى مصدر دخل مستمر مع مرافقة من خبراء في مجالك.
                    </p>
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-600'>
                  <div className='rounded-xl bg-amber-50/80 px-2 py-3'>
                    <p className='font-semibold text-amber-900'>+50</p>
                    <p>دورة متخصصة</p>
                  </div>
                  <div className='rounded-xl bg-amber-50/80 px-2 py-3'>
                    <p className='font-semibold text-amber-900'>1:1</p>
                    <p>مرافقة شخصية</p>
                  </div>
                  <div className='rounded-xl bg-amber-50/80 px-2 py-3'>
                    <p className='font-semibold text-amber-900'>100%</p>
                    <p>تطبيق عملي</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


