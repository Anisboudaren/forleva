'use client'

import { motion } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Scissors, 
  Languages, 
  Palette, 
  ChefHat, 
  Camera, 
  Users,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

const categories = [
  {
    icon: Scissors,
    title: 'الخياطة والتطريز',
    courses: 24,
    gradient: 'from-pink-400 via-rose-400 to-red-400',
    bgLight: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    bgImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'
  },
  {
    icon: Languages,
    title: 'تعلم اللغات',
    courses: 32,
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    bgLight: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    bgImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
  },
  {
    icon: Palette,
    title: 'التجميل والمكياج',
    courses: 18,
    gradient: 'from-fuchsia-400 via-pink-400 to-rose-400',
    bgLight: 'bg-fuchsia-50',
    iconBg: 'bg-fuchsia-100',
    bgImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
  },
  {
    icon: ChefHat,
    title: 'الطبخ والحلويات',
    courses: 28,
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    bgLight: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  },
  {
    icon: Camera,
    title: 'التصوير الفوتوغرافي',
    courses: 21,
    gradient: 'from-cyan-400 via-blue-400 to-indigo-400',
    bgLight: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    bgImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop'
  },
  {
    icon: Users,
    title: 'المهارات الناعمة',
    courses: 35,
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    bgLight: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
  },
  {
    icon: Scissors,
    title: 'الفنون اليدوية',
    courses: 19,
    gradient: 'from-violet-400 via-purple-400 to-fuchsia-400',
    bgLight: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    bgImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'
  },
  {
    icon: Palette,
    title: 'التصميم الجرافيكي',
    courses: 26,
    gradient: 'from-amber-400 via-orange-400 to-red-400',
    bgLight: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    bgImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
  }
]

// Helper function to get icon color class
const getIconColor = (gradientClass: string) => {
  const colorMap: Record<string, string> = {
    'from-pink-400 via-rose-400 to-red-400': 'text-pink-600',
    'from-blue-400 via-indigo-400 to-purple-400': 'text-blue-600',
    'from-fuchsia-400 via-pink-400 to-rose-400': 'text-fuchsia-600',
    'from-orange-400 via-amber-400 to-yellow-400': 'text-orange-600',
    'from-cyan-400 via-blue-400 to-indigo-400': 'text-cyan-600',
    'from-emerald-400 via-teal-400 to-cyan-400': 'text-emerald-600',
    'from-violet-400 via-purple-400 to-fuchsia-400': 'text-violet-600',
    'from-amber-400 via-orange-400 to-red-400': 'text-amber-600'
  }
  return colorMap[gradientClass] || 'text-amber-600'
}

// Helper function to get light color for background pattern
const getLightColor = (gradientClass: string) => {
  const colorMap: Record<string, string> = {
    'from-pink-400 via-rose-400 to-red-400': '#f472b6', // pink-400
    'from-blue-400 via-indigo-400 to-purple-400': '#60a5fa', // blue-400
    'from-fuchsia-400 via-pink-400 to-rose-400': '#e879f9', // fuchsia-400
    'from-orange-400 via-amber-400 to-yellow-400': '#fb923c', // orange-400
    'from-cyan-400 via-blue-400 to-indigo-400': '#22d3ee', // cyan-400
    'from-emerald-400 via-teal-400 to-cyan-400': '#34d399', // emerald-400
    'from-violet-400 via-purple-400 to-fuchsia-400': '#a78bfa', // violet-400
    'from-amber-400 via-orange-400 to-red-400': '#fbbf24' // amber-400
  }
  return colorMap[gradientClass] || '#fbbf24'
}

export function Categories3 () {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollPosition = () => {
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      const maxScroll = scrollWidth - clientWidth

      if (maxScroll <= 0) {
        setTotalPages(1)
        setCurrentPage(0)
        return
      }

      // Calculate based on actual scroll position
      const cardWidth = container.querySelector('.category-card')?.clientWidth || 280
      const gap = 24
      const cardWithGap = cardWidth + gap
      const cardsPerView = Math.floor(clientWidth / cardWithGap)
      
      // Calculate total pages based on number of cards
      const pages = Math.max(1, Math.ceil(categories.length / Math.max(1, cardsPerView)))
      setTotalPages(pages)
      
      // Calculate current page based on scroll position
      const scrollProgress = scrollLeft / maxScroll
      const calculatedPage = Math.round(scrollProgress * (pages - 1))
      const page = Math.max(0, Math.min(calculatedPage, pages - 1))
      
      setCurrentPage(page)
    }

    // Initial calculation
    const timeoutId = setTimeout(updateScrollPosition, 150)
    
    // Update on scroll
    container.addEventListener('scroll', updateScrollPosition, { passive: true })
    window.addEventListener('resize', updateScrollPosition)

    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', updateScrollPosition)
      window.removeEventListener('resize', updateScrollPosition)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const cardWidth = container.querySelector('.category-card')?.clientWidth || 280
    const gap = 24
    const scrollAmount = (cardWidth + gap) * 4 // Scroll 4 cards at a time on mobile, 8 on desktop

    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-white overflow-hidden" dir="rtl" id="categories">
      {/* Gold Flakes Background */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, #fbbf24 1px, transparent 1px),
            radial-gradient(circle at 60% 70%, #f59e0b 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #d97706 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, #fbbf24 1px, transparent 1px),
            radial-gradient(circle at 10% 50%, #f59e0b 1px, transparent 1px),
            radial-gradient(circle at 90% 60%, #d97706 1px, transparent 1px),
            radial-gradient(circle at 30% 10%, #fbbf24 1px, transparent 1px),
            radial-gradient(circle at 70% 90%, #f59e0b 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 180px 180px, 220px 220px, 190px 190px, 210px 210px, 200px 200px, 185px 185px, 195px 195px',
          backgroundPosition: '0 0, 50px 50px, 100px 100px, 150px 150px, 200px 200px, 250px 250px, 300px 300px, 350px 350px'
        }}
      />
      {/* Additional gold sparkles */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #fbbf24 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #f59e0b 2px, transparent 2px),
            radial-gradient(circle at 50% 50%, #d97706 1.5px, transparent 1.5px)
          `,
          backgroundSize: '300px 300px, 280px 280px, 320px 320px',
          backgroundPosition: '0 0, 150px 150px, 300px 300px'
        }}
      />
      
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            استكشف الفئات
          </h2>
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            اختر من بين مجموعة واسعة من الفئات والدورات المتخصصة
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Scrollable Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={index}
                  className="category-card flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
                >
                  <div className="group relative h-full bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                    {/* Background Image - Full opacity */}
                    <div className="absolute inset-0 opacity-100">
                      <Image
                        src={category.bgImage}
                        alt={category.title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 300px) 300px, 300px"
                        quality={95}
                      />
                    </div>
                    {/* Light white overlay for text readability */}
                    <div className="absolute inset-0 bg-white/70 group-hover:bg-white/60 transition-colors duration-300" />
                    {/* Gradient Overlay for better text readability */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    {/* Icon Circle */}
                    <div className="relative mb-6 z-10">
                      <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full ${category.iconBg} group-hover:scale-110 transition-transform duration-300 relative overflow-hidden shadow-md`}>
                        <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-20 group-hover:opacity-30 rounded-full transition-opacity duration-300`} />
                        <Icon className={`relative w-8 h-8 sm:w-10 sm:h-10 ${getIconColor(category.gradient)}`} />
                        <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-xl transition-opacity duration-300 -z-10`} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="relative z-10 text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300 drop-shadow-sm">
                      {category.title}
                    </h3>

                    {/* Course Count */}
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="text-sm sm:text-base font-semibold text-gray-700 drop-shadow-sm">
                        {category.courses}
                      </span>
                      <span className="text-sm sm:text-base text-gray-600 drop-shadow-sm">
                        دورة
                      </span>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className={`absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-100 rounded-b-2xl transition-opacity duration-300`} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Scroll Progress Indicator - Long Dots */}
          {totalPages > 0 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706]'
                      : 'bg-gray-300'
                  }`}
                  style={{
                    width: index === currentPage ? '32px' : '8px',
                    opacity: index === currentPage ? 1 : 0.4
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
