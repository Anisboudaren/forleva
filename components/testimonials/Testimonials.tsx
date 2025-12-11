'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

const testimonials = [
  {
    id: 1,
    name: 'فاطمة الزهراء',
    role: 'مطور واجهات أمامية',
    location: 'الرياض، السعودية',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-female.png',
    rating: 5,
    courseName: 'تعلم React من الصفر',
    courseLength: '8 أسابيع',
    date: 'منذ 3 أشهر',
    verified: true,
    text: 'دورة React كانت رائعة! في 8 أسابيع فقط أصبحت قادرة على بناء تطبيقات ويب احترافية. المحتوى منظم والتمارين العملية ممتازة. المدرب كان محترفاً جداً.'
  },
  {
    id: 2,
    name: 'يوسف بن علي',
    role: 'مسوق رقمي',
    location: 'دبي، الإمارات',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-2.png',
    rating: 4,
    courseName: 'التسويق الرقمي المتقدم',
    courseLength: '6 أسابيع',
    date: 'منذ شهرين',
    verified: true,
    text: 'دورة التسويق الرقمي غيرت مسيرتي المهنية تماماً. في 6 أسابيع تعلمت استراتيجيات حديثة ساعدتني في زيادة مبيعاتي بنسبة 300%. أنصح بها بشدة.'
  },
  {
    id: 3,
    name: 'مريم قاسم',
    role: 'مصمم جرافيك',
    location: 'القاهرة، مصر',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-1.png',
    rating: 5,
    courseName: 'تصميم واجهات المستخدم',
    courseLength: '10 أسابيع',
    date: 'منذ 5 أشهر',
    verified: true,
    text: 'دورة UI/UX كانت شاملة جداً. خلال 10 أسابيع تعلمت كل شيء من الأساسيات إلى التصميم الاحترافي. الآن أعمل مع عملاء دوليين!'
  },
  {
    id: 4,
    name: 'أحمد كمال',
    role: 'مهندس برمجيات',
    location: 'عمان، الأردن',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-1.png',
    rating: 4,
    courseName: 'Node.js للمحترفين',
    courseLength: '12 أسبوع',
    date: 'منذ 4 أشهر',
    verified: true,
    text: 'دورة Node.js كانت عميقة ومفيدة. في 12 أسبوع تعلمت بناء تطبيقات خلفية قوية. المحتوى متقدم والمدرب محترف.'
  },
  {
    id: 5,
    name: 'خديجة منصور',
    role: 'مدربة حياة',
    location: 'الدار البيضاء، المغرب',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-female.png',
    rating: 4,
    courseName: 'ريادة الأعمال الناجحة',
    courseLength: '7 أسابيع',
    date: 'منذ شهر',
    verified: true,
    text: 'دورة ريادة الأعمال ساعدتني في إطلاق مشروعي بنجاح. في 7 أسابيع فقط تعلمت كل ما أحتاجه من التخطيط إلى التنفيذ. أنصح بها بشدة!'
  },
  {
    id: 6,
    name: 'علياء فوزي',
    role: 'محلل بيانات',
    location: 'بيروت، لبنان',
    avatar: 'https://cdn.rareblocks.xyz/collection/clarity/images/testimonial/4/avatar-male-2.png',
    rating: 4,
    courseName: 'تحليل البيانات المتقدم',
    courseLength: '9 أسابيع',
    date: 'منذ 6 أشهر',
    verified: true,
    text: 'دورة تحليل البيانات كانت استثماراً رائعاً. خلال 9 أسابيع تعلمت استخدام أدوات متقدمة وأصبحت قادرة على اتخاذ قرارات مدروسة بناءً على البيانات.'
  }
]

function StarIcon () {
  return (
    <div className='relative inline-flex items-center justify-center w-5 h-5'>
      <div className='absolute inset-0' style={{ backgroundColor: '#FDB241' }} />
      <svg
        className='relative w-4 h-4 text-white'
        viewBox='0 0 799.89 761'
        xmlns='http://www.w3.org/2000/svg'
        fill='currentColor'
      >
        <path d='M799.89 290.83H494.44L400.09 0l-94.64 290.83L0 290.54l247.37 179.92L152.72 761l247.37-179.63L647.16 761l-94.35-290.54z' fill='currentColor' />
      </svg>
    </div>
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
                    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 15%, #d97706 30%, #f59e0b 45%, #fbbf24 60%, #fcd34d 75%, #f59e0b 90%, #d97706 100%)'
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
                  <div className='flex flex-col overflow-hidden shadow-md bg-white rounded-2xl h-full border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-yellow-300'>
                    <div className='flex flex-col justify-between flex-1 p-6 lg:p-7'>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-1'>
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <StarIcon key={i} />
                            ))}
                          </div>
                          {testimonial.verified && (
                            <div className='flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full'>
                              <svg className='w-3 h-3 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                              </svg>
                              <span className='text-xs font-medium text-green-700'>متحقق</span>
                            </div>
                          )}
                        </div>

                        <div className='mb-4 pb-4 border-b border-gray-100'>
                          <p className='text-sm font-semibold text-gray-900 text-right mb-1'>{testimonial.courseName}</p>
                          <div className='flex items-center justify-end gap-2 text-xs text-gray-500'>
                            <span>{testimonial.courseLength}</span>
                            <span>•</span>
                            <span>{testimonial.date}</span>
                          </div>
                        </div>

                        <blockquote className='flex-1'>
                          <p className='text-[15px] leading-relaxed text-gray-800 text-right'>
                            {testimonial.text}
                          </p>
                        </blockquote>
                      </div>

                      <div className='flex items-center justify-end mt-6 pt-5 border-t border-gray-100'>
                        <div className='ml-3 text-right flex-1'>
                          <div className='flex items-center justify-end gap-2 mb-1'>
                            <p className='text-base font-semibold text-gray-900'>{testimonial.name}</p>
                            {testimonial.verified && (
                              <svg className='w-4 h-4 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                              </svg>
                            )}
                          </div>
                          <p className='text-sm text-gray-600 mb-1'>{testimonial.role}</p>
                          <p className='text-xs text-gray-500'>{testimonial.location}</p>
                        </div>
                        <Image
                          className='flex-shrink-0 object-cover rounded-full w-14 h-14 ring-2 ring-gray-200'
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={56}
                          height={56}
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
                  <div className='flex flex-col overflow-hidden shadow-md bg-white rounded-2xl h-full border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-yellow-300'>
                    <div className='flex flex-col justify-between flex-1 p-6 lg:p-7'>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-1'>
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <StarIcon key={i} />
                            ))}
                          </div>
                          {testimonial.verified && (
                            <div className='flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full'>
                              <svg className='w-3 h-3 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                              </svg>
                              <span className='text-xs font-medium text-green-700'>متحقق</span>
                            </div>
                          )}
                        </div>

                        <div className='mb-4 pb-4 border-b border-gray-100'>
                          <p className='text-sm font-semibold text-gray-900 text-right mb-1'>{testimonial.courseName}</p>
                          <div className='flex items-center justify-end gap-2 text-xs text-gray-500'>
                            <span>{testimonial.courseLength}</span>
                            <span>•</span>
                            <span>{testimonial.date}</span>
                          </div>
                        </div>

                        <blockquote className='flex-1'>
                          <p className='text-[15px] leading-relaxed text-gray-800 text-right'>
                            {testimonial.text}
                          </p>
                        </blockquote>
                      </div>

                      <div className='flex items-center justify-end mt-6 pt-5 border-t border-gray-100'>
                        <div className='ml-3 text-right flex-1'>
                          <div className='flex items-center justify-end gap-2 mb-1'>
                            <p className='text-base font-semibold text-gray-900'>{testimonial.name}</p>
                            {testimonial.verified && (
                              <svg className='w-4 h-4 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                              </svg>
                            )}
                          </div>
                          <p className='text-sm text-gray-600 mb-1'>{testimonial.role}</p>
                          <p className='text-xs text-gray-500'>{testimonial.location}</p>
                        </div>
                        <Image
                          className='flex-shrink-0 object-cover rounded-full w-14 h-14 ring-2 ring-gray-200'
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={56}
                          height={56}
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

