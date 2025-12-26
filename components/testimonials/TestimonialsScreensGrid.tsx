'use client'

import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

const screenshotTestimonials = [
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (1).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (2).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (3).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.29 (4).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (1).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (2).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.30 (3).jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.31.jpeg',
  '/testamnials/WhatsApp Image 2025-12-18 at 15.00.32.jpeg'
]

export function TestimonialsScreensGrid () {
  return (
    <section className='py-12 sm:py-16 lg:py-20 bg-white'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='max-w-2xl mx-auto text-center'>
          <p className='text-sm font-medium text-yellow-600'>
            من رسائل المتعلّمين الحقيقيين
          </p>
          <h2 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
            لقطات شاشة من <GradientText text='شكر المتدربين' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className='mt-3 text-sm leading-7 text-gray-600 sm:text-base'>
            آراء حقيقية كما وصلتنا في المحادثات، بدون تعديل، تعكس أثر الرحلة التعليمية على أرض الواقع.
          </p>
        </div>

        <div className='grid mt-10 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {screenshotTestimonials.map((src, index) => (
            <div
              key={src}
              className='relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm'
            >
              <div className='relative h-64 sm:h-72'>
                <Image
                  src={src}
                  alt={`رسالة شكر ${index + 1}`}
                  fill
                  className='object-contain w-full h-full bg-gray-50'
                  sizes='(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


