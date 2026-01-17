'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Sparkles, Rocket, Users, BookOpen, User } from 'lucide-react'

export function Hero3 () {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 sm:pt-24 md:pt-28 lg:pt-24 pb-8 sm:pb-12 md:pb-16 lg:pb-20"
      dir="rtl"
      id="hero"
    >
      {/* Background - Dark gradient at top for white header text, quickly fades to white */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/20 to-transparent -z-10 h-[180px] md:h-[200px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white -z-10 pt-[180px] md:pt-[200px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/30 to-white -z-10" />
      
      {/* Optional geometric pattern overlay - very subtle */}
      <div className="absolute inset-0 opacity-[0.015] -z-10" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 w-full h-full">
        <div className="grid items-center gap-6 sm:gap-8 md:gap-10 lg:grid-cols-[65%_35%] lg:gap-6 xl:gap-8">
          {/* Content Section - Right side on desktop (RTL) */}
          <motion.div
            className="text-right space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Badge/Tag */}
            <motion.div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-900 bg-amber-50/90 border border-amber-200/70 rounded-full backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              <span>صدّق... توصل</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-[1.3] text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            >
              <span className="block md:inline-block">
                أول منصّة تعليمية ترافقك من
                <span className="md:hidden"><br /></span>
                <span className="hidden md:inline"> التعلّم</span>
              </span>
              <span className="block md:inline-block md:mr-0">
                <span className="md:hidden">التعلّم </span>
                الى{' '}
                <GradientText
                  text="تحقيق الدخل"
                  gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
                  className="inline-block"
                />
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              className="max-w-xl ml-auto text-sm sm:text-base md:text-lg leading-relaxed text-gray-600"
              initial={{ opacity: 0, y: 15 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            >
              دورات أونلاين في مجالات متنوّعة، نعلّمك خطوة بخطوة حتى تحوّل مهارتك إلى مصدر دخل حقيقي
            </motion.p>

            {/* Social Proof */}
            <motion.div
              className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 text-gray-700">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                </div>
                <span className="text-xs sm:text-sm font-medium">+100,000 متعلم</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                </div>
                <span className="text-xs sm:text-sm font-medium">+200 دورة متخصصة</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
            >
              {/* Primary CTA */}
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-black text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 overflow-hidden shadow-lg hover:shadow-xl hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                  fontWeight: 900
                }}
              >
                <span className="relative z-10 flex items-center gap-2 font-black" style={{ fontWeight: 900 }}>
                  سجل الآن مجاناً
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>

              {/* Secondary CTA */}
              <Link
                href="#courses"
                onClick={(e) => smoothScrollTo(e, 'courses')}
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-black text-gray-900 border-2 border-gray-300 rounded-full transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                style={{ fontWeight: 900 }}
              >
                استكشف الدورات
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Section - Left side on desktop (RTL) */}
          <div className="relative w-full order-1 lg:order-2 flex items-center justify-center">
            {/* Desktop Image - hero-guy-with-logo-2.png */}
            <div className="hidden md:block relative w-full h-full flex items-center justify-center overflow-visible">
              <Image
                className="w-full h-auto max-w-[110%] xl:max-w-[120%] mx-auto object-contain"
                src="/home page/hero guy with logo 2.png"
                alt="Forleva Hero"
                width={1000}
                height={1000}
                priority
                quality={95}
              />
            </div>

            {/* Mobile Image - hero-guy-with-logo-2.png */}
            <div className="md:hidden relative">
              <Image
                className="w-full h-auto max-w-sm mx-auto object-contain"
                src="/home page/hero guy with logo 2.png"
                alt="Forleva Hero"
                width={400}
                height={400}
                priority
                quality={95}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
