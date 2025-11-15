'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

const testimonials = [
  {
    id: 1,
    name: 'فاطمة الزهراء',
    role: 'مطور واجهات أمامية',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-female.png',
    rating: 5,
    courseName: 'تعلم React من الصفر',
    courseLength: '8 أسابيع',
    text: 'دورة React كانت رائعة! في 8 أسابيع فقط أصبحت قادرة على بناء تطبيقات ويب احترافية. المحتوى منظم والتمارين العملية ممتازة.'
  },
  {
    id: 2,
    name: 'يوسف بن علي',
    role: 'مسوق رقمي',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-2.png',
    rating: 5,
    courseName: 'التسويق الرقمي المتقدم',
    courseLength: '6 أسابيع',
    text: 'دورة التسويق الرقمي غيرت مسيرتي المهنية تماماً. في 6 أسابيع تعلمت استراتيجيات حديثة ساعدتني في زيادة مبيعاتي بنسبة 300%.'
  },
  {
    id: 3,
    name: 'مريم قاسم',
    role: 'مصمم جرافيك',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-1.png',
    rating: 5,
    courseName: 'تصميم واجهات المستخدم',
    courseLength: '10 أسابيع',
    text: 'دورة UI/UX كانت شاملة جداً. خلال 10 أسابيع تعلمت كل شيء من الأساسيات إلى التصميم الاحترافي. الآن أعمل مع عملاء دوليين!'
  },
  {
    id: 4,
    name: 'أحمد كمال',
    role: 'مهندس برمجيات',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-1.png',
    rating: 4,
    courseName: 'Node.js للمحترفين',
    courseLength: '12 أسبوع',
    text: 'دورة Node.js كانت عميقة ومفيدة. في 12 أسبوع تعلمت بناء تطبيقات خلفية قوية. المحتوى متقدم والمدرب محترف.'
  },
  {
    id: 5,
    name: 'خديجة منصور',
    role: 'مدربة حياة',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-female.png',
    rating: 5,
    courseName: 'ريادة الأعمال الناجحة',
    courseLength: '7 أسابيع',
    text: 'دورة ريادة الأعمال ساعدتني في إطلاق مشروعي بنجاح. في 7 أسابيع فقط تعلمت كل ما أحتاجه من التخطيط إلى التنفيذ. أنصح بها بشدة!'
  },
  {
    id: 6,
    name: 'علياء فوزي',
    role: 'محلل بيانات',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-2.png',
    rating: 4,
    courseName: 'تحليل البيانات المتقدم',
    courseLength: '9 أسابيع',
    text: 'دورة تحليل البيانات كانت استثماراً رائعاً. خلال 9 أسابيع تعلمت استخدام أدوات متقدمة وأصبحت قادرة على اتخاذ قرارات مدروسة بناءً على البيانات.'
  }
]

function StarIcon () {
  return (
    <svg
      className='w-5 h-5 text-[#FDB241]'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
    </svg>
  )
}

export function Testimonials () {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRefReverse = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let animationFrameId: number | null = null

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Force LTR direction for scrolling to work properly
      container.setAttribute('dir', 'ltr')
      
      const scrollAmount = 0.5

      function scroll () {
        if (container) {
          const currentScroll = container.scrollLeft
          container.scrollLeft = currentScroll + scrollAmount
          
          // Calculate the width of one set of testimonials
          const firstCard = container.querySelector('[data-testimonial-card]') as HTMLElement
          if (firstCard && firstCard.offsetWidth > 0) {
            const cardWidth = firstCard.offsetWidth
            const gap = 24 // gap-6 = 24px
            const singleSetWidth = testimonials.length * (cardWidth + gap)
            
            // When we've scrolled past one full set, reset seamlessly
            if (container.scrollLeft >= singleSetWidth) {
              container.scrollLeft = container.scrollLeft - singleSetWidth
            }
          }
        }
        
        animationFrameId = requestAnimationFrame(scroll)
      }

      animationFrameId = requestAnimationFrame(scroll)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRefReverse.current
    if (!container) return

    let animationFrameId: number | null = null

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Force LTR direction for scrolling to work properly
      container.setAttribute('dir', 'ltr')
      
      // Set initial scroll position first
      const firstCard = container.querySelector('[data-testimonial-card]') as HTMLElement
      if (firstCard && firstCard.offsetWidth > 0) {
        const cardWidth = firstCard.offsetWidth
        const gap = 24
        const singleSetWidth = testimonials.length * (cardWidth + gap)
        container.scrollLeft = singleSetWidth
      }
      
      const scrollAmount = 0.5

      function scroll () {
        if (container) {
          const currentScroll = container.scrollLeft
          container.scrollLeft = currentScroll - scrollAmount
          
          // Calculate the width of one set of testimonials
          const firstCard = container.querySelector('[data-testimonial-card]') as HTMLElement
          if (firstCard && firstCard.offsetWidth > 0) {
            const cardWidth = firstCard.offsetWidth
            const gap = 24 // gap-6 = 24px
            const singleSetWidth = testimonials.length * (cardWidth + gap)
            
            // When we've scrolled past the beginning, reset seamlessly
            if (container.scrollLeft <= 0) {
              container.scrollLeft = container.scrollLeft + singleSetWidth
            }
          }
        }
        
        animationFrameId = requestAnimationFrame(scroll)
      }

      // Start animation after initial position is set
      animationFrameId = requestAnimationFrame(scroll)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className='py-12 bg-gray-50 sm:py-16 lg:py-20'>
      <div className='px-4 mx-auto sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center'>
          <div className='text-center max-w-md mx-auto sm:max-w-lg'>
            <p className='text-lg font-medium text-gray-600'>
              أكثر من 2,000 متعلم يثقون بنا
            </p>
            <h2 className='mt-2 sm:mt-4 text-[22px] font-bold text-gray-900 sm:text-4xl xl:text-5xl'>
              ماذا يقول <GradientText text='عملاؤنا' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' /> عنا
            </h2>
          </div>

          <div className='relative mt-10 md:mt-24 w-full overflow-hidden lg:w-screen lg:-mx-8 xl:-mx-12 lg:py-8 xl:py-12'>
            {/* Top fade overlay */}
            <div className='absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none' />
            
            {/* Bottom fade overlay */}
            <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none' />
            
            <div className='absolute -inset-x-1 inset-y-16 md:-inset-x-2 md:-inset-y-6 pointer-events-none'>
              <div
                className='w-full h-full max-w-5xl mx-auto rounded-3xl opacity-30 blur-lg filter'
                style={{
                  background:
                    'linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)'
                }}
              />
            </div>

            <div
              ref={scrollContainerRef}
              className='relative flex gap-6 overflow-x-auto scrollbar-hide'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                direction: 'ltr'
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  data-testimonial-card
                  className='flex-shrink-0 w-80 md:w-96'
                >
                  <div className='flex flex-col overflow-hidden shadow-xl bg-white rounded-xl h-full'>
                    <div className='flex flex-col justify-between flex-1 p-6 lg:py-8 lg:px-7'>
                      <div className='flex-1'>
                        <div className='flex items-center justify-end'>
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <StarIcon key={i} />
                          ))}
                        </div>

                        <div className='mt-4 mb-2'>
                          <p className='text-sm font-semibold text-gray-900 text-right'>{testimonial.courseName}</p>
                          <p className='text-xs text-gray-500 text-right mt-1'>{testimonial.courseLength}</p>
                        </div>

                        <blockquote className='flex-1 mt-4'>
                          <p className='text-lg leading-relaxed text-gray-900 text-right'>
                            "{testimonial.text}"
                          </p>
                        </blockquote>
                      </div>

                      <div className='flex items-center justify-end mt-8'>
                        <div className='ml-4 text-right'>
                          <p className='text-base font-bold text-gray-900'>{testimonial.name}</p>
                          <p className='mt-0.5 text-sm text-gray-600'>{testimonial.role}</p>
                        </div>
                        <Image
                          className='flex-shrink-0 object-cover rounded-full w-11 h-11'
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={44}
                          height={44}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              ref={scrollContainerRefReverse}
              className='relative flex gap-6 overflow-x-auto scrollbar-hide mt-6'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                direction: 'ltr'
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={`reverse-${testimonial.id}-${index}`}
                  data-testimonial-card
                  className='flex-shrink-0 w-80 md:w-96'
                >
                  <div className='flex flex-col overflow-hidden shadow-xl bg-white rounded-xl h-full'>
                    <div className='flex flex-col justify-between flex-1 p-6 lg:py-8 lg:px-7'>
                      <div className='flex-1'>
                        <div className='flex items-center justify-end'>
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <StarIcon key={i} />
                          ))}
                        </div>

                        <div className='mt-4 mb-2'>
                          <p className='text-sm font-semibold text-gray-900 text-right'>{testimonial.courseName}</p>
                          <p className='text-xs text-gray-500 text-right mt-1'>{testimonial.courseLength}</p>
                        </div>

                        <blockquote className='flex-1 mt-4'>
                          <p className='text-lg leading-relaxed text-gray-900 text-right'>
                            "{testimonial.text}"
                          </p>
                        </blockquote>
                      </div>

                      <div className='flex items-center justify-end mt-8'>
                        <div className='ml-4 text-right'>
                          <p className='text-base font-bold text-gray-900'>{testimonial.name}</p>
                          <p className='mt-0.5 text-sm text-gray-600'>{testimonial.role}</p>
                        </div>
                        <Image
                          className='flex-shrink-0 object-cover rounded-full w-11 h-11'
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={44}
                          height={44}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

