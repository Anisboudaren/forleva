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

export function TestimonialsScreensCollage () {
  const firstColumn = screenshotTestimonials.slice(0, 4)
  const secondColumn = screenshotTestimonials.slice(4, 8)
  const thirdColumn = screenshotTestimonials.slice(8)

  return (
    <section className='py-12 sm:py-16 lg:py-20 bg-white'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] lg:items-start'>
          <div className='text-right max-w-xl lg:ml-auto space-y-4'>
            <p className='text-sm font-medium text-yellow-600'>
              أثر حقيقي على المتعلّمين
            </p>
            <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl'>
              قصص نجاح مكتوبة <GradientText text='بأيدي المتدرّبين' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h2>
            <p className='text-sm leading-7 text-gray-600 sm:text-base'>
              هنا نعرض لك لقطات شاشة من رسائل شكر حقيقية من المتعلّمين الذين أنهوا دوراتهم وبدأوا
              في تطبيق ما تعلّموه على أرض الواقع. هذه ليست شعارات، بل كلمات من أشخاص مثلك.
            </p>
            <ul className='mt-3 space-y-2 text-sm text-gray-700'>
              <li>• رسائل من منصّات مختلفة مثل واتساب توضّح رضا المتدرّبين.</li>
              <li>• شهادات تعبّر عن انتقالهم من التعلّم إلى التطبيق العملي.</li>
              <li>• دليل اجتماعي قوي يساعدك على اتخاذ قرار البداية بثقة.</li>
            </ul>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {[firstColumn, secondColumn, thirdColumn].map((column, colIndex) => (
              <div
                key={colIndex}
                className={`space-y-4 ${
                  colIndex === 1 ? 'mt-4 sm:mt-8' : colIndex === 2 ? 'mt-2 sm:mt-12' : ''
                }`}
              >
                {column.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className='relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm'
                  >
                    <div className='relative h-52 sm:h-56'>
                      <Image
                        src={src}
                        alt={`رسالة شكر ${index + 1}`}
                        fill
                        className='object-contain w-full h-full bg-gray-50'
                        sizes='(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 100vw'
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


