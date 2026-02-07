'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { GradientText } from '@/components/text/gradient-text'
import { ZoomIn, X } from 'lucide-react'

const testimonialImages = [
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (1).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (2).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (3).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (4).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (1).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (2).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (3).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.31.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.32.jpeg'
]

export function Testimonials3 () {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Enable manual scrolling
    container.style.scrollBehavior = 'smooth'
  }, [])

  const openImage = (imageSrc: string) => {
    setSelectedImage(imageSrc)
    document.body.style.overflow = 'hidden'
  }

  const closeImage = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'unset'
  }

  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-white" dir="rtl">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            آراء <GradientText text='مشاركين' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base max-w-2xl mx-auto">
            شاهد ما يقوله المتعلمون الحقيقيون عن تجربتهم معنا
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth py-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {testimonialImages.map((src, index) => (
              <motion.div
                key={src}
                className="flex-shrink-0 snap-start"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="relative group">
                  <div className="relative w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:border-amber-300">
                    <Image
                      src={src}
                      alt={`رأي مشارك ${index + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="(min-width: 768px) 384px, (min-width: 640px) 320px, 256px"
                    />
                  </div>
                  
                  {/* Zoom Button */}
                  <button
                    onClick={() => openImage(src)}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all duration-300 rounded-xl group"
                    aria-label="تكبير الصورة"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <ZoomIn className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox/Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
              onClick={closeImage}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeImage}
                  className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-6 h-6 text-gray-900" />
                </button>

                {/* Image */}
                <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
                  <Image
                    src={selectedImage}
                    alt="رأي مشارك"
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  )
}

