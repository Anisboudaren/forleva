'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { motion } from 'motion/react'

export function Hero2 () {
  return (
    <AuroraBackground className='pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 xl:pb-0'>
      <section className='relative'>
        <div className='relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
        <motion.div
          className='max-w-3xl mx-auto text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.p
            className='inline-flex px-4 py-2 text-base text-gray-900 border border-gray-200 rounded-full'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            ✨ صدّق... توصل
          </motion.p>

          <motion.h1
            className='mt-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
          >
            أول منصّة ترافقك من التعلّم إلى الاحتراف و<GradientText text='تحقيق الدخل' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
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
            <div className='absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200'></div>

            <Link
              href='#'
              title=''
              className='relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
              role='button'
            >
              ابدأ رحلتك الآن
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className='mt-16 md:mt-20'>
        <div className='md:hidden w-full flex justify-center px-4 overflow-hidden'>
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              className='object-contain w-full h-auto max-w-md mx-auto scale-[1.3]'
              src='/hero section image without bg.png'
              alt='Hero illustration mobile'
              width={800}
              height={800}
              priority
            />
          </motion.div>
        </div>
        <motion.div
          className='hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              className='object-cover object-top w-full h-auto mx-auto scale-150 2xl:max-w-screen-2xl xl:scale-100'
              src='https://d33wubrfki0l68.cloudfront.net/54780decfb9574945bc873b582cdc6156144a2ba/d9fa1/images/hero/4/illustration.png'
              alt='Hero illustration desktop'
              width={1200}
              height={600}
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
    </AuroraBackground>
  )
}

