'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { motion } from 'motion/react'

export function Hero2AuroraLogo () {
  return (
    <AuroraBackground className='pt-24 md:pt-28 lg:pt-32 pb-16'>
      <section className='relative'>
        <div className='px-4 mx-auto max-w-6xl sm:px-6 lg:px-8'>
          <div className='grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-16'>
            <motion.div
              className='text-right'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className='inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/40 px-4 py-2 shadow-sm shadow-amber-300/40 backdrop-blur-md mb-4'>
                <div className='relative h-9 w-9 rounded-full bg-white/90 shadow-[0_0_0_4px_rgba(253,224,71,0.75)] flex items-center justify-center'>
                  <Image
                    src='/logo with brand name (black colored ).png'
                    alt='Forleva Logo'
                    width={80}
                    height={40}
                    className='h-6 w-auto'
                  />
                </div>
                <p className='text-sm font-medium text-amber-900 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)]'>
                  أول منصّة عربية تجمع بين التعلّم وتحقيق الدخل
                </p>
              </div>

              <motion.p
                className='inline-flex px-4 py-2 text-base text-amber-950 border border-amber-200/70 rounded-full bg-amber-50/90'
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                ✨ شعارنا: صدّق... توصل
              </motion.p>

              <motion.h1
                className='mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.18)]'
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
              >
                أول منصّة ترافقك من التعلّم إلى الاحتراف و
                <GradientText text='تحقيق الدخل' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
              </motion.h1>

              <motion.p
                className='max-w-md mt-5 text-base leading-7 text-slate-800/90 ml-auto drop-shadow-[0_8px_25px_rgba(0,0,0,0.13)]'
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
              >
                دورات أونلاين في مجالات متنوّعة، نعلّمك خطوة بخطوة حتى تحوّل مهارتك إلى مصدر دخل حقيقي
              </motion.p>

              <motion.div
                className='flex flex-wrap items-center gap-4 mt-8 justify-start lg:justify-end'
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
              >
                <Link
                  href='#'
                  title=''
                  className='relative inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 bg-amber-300/90 rounded-full shadow-[0_18px_40px_rgba(217,119,6,0.55)] hover:bg-amber-400'
                  role='button'
                >
                  ابدأ رحلتك الآن
                </Link>

                <span className='text-xs text-slate-900/80'>
                  بدون التزام، يمكنك البدء مجاناً ثم الترقية وقت ما تحب.
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className='relative w-full max-w-md mx-auto lg:max-w-lg lg:ml-0 lg:mr-auto'
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            >
              <div className='absolute -inset-6 rounded-[3rem] bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] opacity-75 blur-3xl' />
              <div className='relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/85 shadow-[0_25px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl'>
                <div className='px-5 pt-4 pb-5'>
                  <div className='flex items-center justify-between gap-4 mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] text-white shadow-[0_10px_30px_rgba(217,119,6,0.65)]'>
                        <span className='text-xl'>🎓</span>
                      </div>
                      <div className='text-right'>
                        <p className='text-xs text-slate-500'>خطة التعلّم الشخصية</p>
                        <p className='text-sm font-semibold text-slate-900'>مسارك نحو الاحتراف</p>
                      </div>
                    </div>
                    <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800'>
                      جاهزة للبدء
                    </span>
                  </div>

                  <div className='grid grid-cols-3 gap-3 text-center text-xs text-slate-700'>
                    <div className='rounded-2xl bg-amber-50/85 px-2 py-3'>
                      <p className='text-sm font-semibold text-amber-900'>مسار تعلّم</p>
                      <p>من الصفر حتى أول دخل</p>
                    </div>
                    <div className='rounded-2xl bg-amber-50/85 px-2 py-3'>
                      <p className='text-sm font-semibold text-amber-900'>جلسات مباشرة</p>
                      <p>أسئلة و أجوبة مع الخبراء</p>
                    </div>
                    <div className='rounded-2xl bg-amber-50/85 px-2 py-3'>
                      <p className='text-sm font-semibold text-amber-900'>مجتمع خاص</p>
                      <p>شبكة داعمة من المتعلّمين</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </AuroraBackground>
  )
}


