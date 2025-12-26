'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'

export function Hero2CenteredLogo () {
  return (
    <section className='relative bg-gradient-to-b from-amber-50 via-white to-amber-50/60 py-16 sm:py-20 lg:py-24'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <motion.div
          className='max-w-3xl mx-auto text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className='flex justify-center mb-6 sm:mb-8'>
            <div className='relative inline-flex items-center justify-center rounded-3xl bg-white shadow-[0_20px_60px_rgba(180,83,9,0.18)] px-6 py-3 sm:px-8 sm:py-4'>
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 opacity-30 blur-xl' />
              <Image
                src='/logo with brand name (black colored ).png'
                alt='Forleva Logo'
                width={260}
                height={100}
                className='relative z-10 h-12 w-auto sm:h-14'
                priority
              />
            </div>
          </div>

          <motion.p
            className='inline-flex px-4 py-2 text-base text-amber-900 border border-amber-200 rounded-full bg-amber-50/80'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            ✨ شعارنا: صدّق... توصل
          </motion.p>

          <motion.h1
            className='mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
          >
            أول منصّة ترافقك من التعلّم إلى الاحتراف و
            <GradientText text='تحقيق الدخل' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </motion.h1>

          <motion.p
            className='max-w-md mx-auto mt-6 text-base leading-7 text-gray-600'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
          >
            دورات أونلاين في مجالات متنوّعة، نعلّمك خطوة بخطوة حتى تحوّل مهارتك إلى مصدر دخل حقيقي
          </motion.p>

          <motion.div
            className='relative inline-flex mt-10 group'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
          >
            <div className='absolute transition-all duration-700 opacity-90 -inset-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-2xl blur-md group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200' />

            <Link
              href='#'
              title=''
              className='relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-amber-950 transition-all duration-200 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400'
              role='button'
            >
              ابدأ رحلتك الآن
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


