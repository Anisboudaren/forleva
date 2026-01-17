'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'

const paymentImages = [
  '/how_to_use/visa pay .png',
  '/how_to_use/mc pay .png',
  '/how_to_use/CIB pay .png',
  '/how_to_use/dahbia pay .png',
  '/how_to_use/paypal.png'
]

const faqs = [
  {
    id: 1,
    question: 'كيف يمكنني التسجيل في الدورات؟',
    answer:
      'يمكنك التسجيل بسهولة من خلال إنشاء حساب مجاني على المنصة التعليمية، ثم تصفح الدورات المتاحة واختيار ما يناسبك. يمكنك الدفع عبر طرق متعددة آمنة، مباشرة بعدها يتم تفعيل دورتك على حسابك في المنصة التعليمية.',
    link: '/courses',
    linkText: 'استكشف الدورات'
  },
  {
    id: 2,
    question: 'هل تبقى الدورات مسجلة عندي؟',
    answer:
      'نعم أكيد، تبقى الدورات مسجلة عندك في حسابك على المنصة التعليمية لمدة عام كامل ابتداءً من تاريخ تفعيل الدورات، لمشاهدتها وقت ما يناسبك.'
  },
  {
    id: 3,
    question: 'هل يمكنني تجديد الاشتراك بعد انتهاء العام الأول؟',
    answer: 'نعم أكيد، يمكنك تجديد الاشتراك في أي دورة تريدها بعد انتهاء مدة الاشتراك الأولى.',
    link: '/courses',
    linkText: 'تصفح الدورات'
  },
  {
    id: 4,
    question: 'ما هي طرق الدفع المتاحة؟',
    answer:
      'يوجد العديد من طرق الدفع المتاحة، يمكنك اختيار ما يناسبك: CCP، BARIDIMOB، CIB، Visa Card، Master Card، PayPal.',
    link: '/how-it-works',
    linkText: 'تعرف على المزيد'
  },
  {
    id: 5,
    question: 'ما هي أنواع الشهادات التي تقدمونها؟',
    answer:
      'نقدم ثلاثة أنواع من الشهادات باسمك يمكنك تحميلها من المنصة التعليمية: شهادة مشاركة مجانية، شهادة معترف بها وطنياً مدفوعة، شهادة معترف بها دولياً مدفوعة.',
    link: '/certificates',
    linkText: 'اعرف المزيد عن الشهادات'
  },
  {
    id: 6,
    question: 'هل التكوين مناسب للمبتدئين؟',
    answer:
      'نعم، الشرح والتطبيق بالتفصيل خطوة بخطوة، مناسب حتى لو ما عندك أي خبرة سابقة.',
    link: '/courses',
    linkText: 'استكشف الدورات'
  },
  {
    id: 7,
    question: 'هل هنالك دعم ومتابعة بعد الاشتراك في الدورات؟',
    answer:
      'نعم أكيد، يتحصل كل مشارك(ة) في أي دورة على متابعة ومرافقة شخصية من طرف المدرب.'
  },
  {
    id: 8,
    question: 'هل في الدورات على المنصة نتعلم الجانب التطبيقي أم فقط النظري؟',
    answer:
      'الدورات على المنصة التعليمية مركزة على التطبيق العملي، كل دورة فيها تعليم نظري وتطبيقي حتى تتمكن من التطبيق مباشرة على أرض الواقع وتكتسب خبرة حقيقية.',
    link: '/courses',
    linkText: 'شاهد الدورات المتاحة'
  },
  {
    id: 9,
    question: 'هل يمكنني التواصل مع المدربين؟',
    answer:
      'يمكنك التواصل مع المدربين عبر المنصة التعليمية من خلال رسائل مباشرة، ومعظم المدربين يردون خلال 24 ساعة.',
    link: '/signup',
    linkText: 'سجل الآن'
  },
  {
    id: 10,
    question: 'هل تساعدني المنصة إذا أردت بدء مشروعي الشخصي؟',
    answer:
      'نعم، تساعدك المنصة التعليمية على تحقيق فكرة مشروعك حتى تجسدها على أرض الواقع عن طريق تقديم دعم ومرافقة مدفوعة من طرف خبراء.',
    link: '/courses',
    linkText: 'ابدأ رحلتك'
  },
  {
    id: 11,
    question: 'هل يمكنني استرداد المبلغ إذا لم تعجبني الدورة؟',
    answer:
      'نعم، نقدم ضمان استرداد المبلغ خلال يومين من تاريخ الشراء إذا لم تكن راضياً عن المحتوى لأسباب واضحة.'
  }
]

export function Faq () {
  const [openId, setOpenId] = useState<number | null>(1)

  function toggleFaq (id: number) {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className='py-12 bg-white sm:py-16 lg:py-20'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='text-center mb-12 max-w-md mx-auto sm:max-w-lg'>
            <p className='text-lg font-medium text-gray-600'>
              إجابات على الأسئلة الأكثر شيوعاً
            </p>
            <h2 className='mt-2 sm:mt-4 text-[22px] font-bold text-gray-900 sm:text-4xl xl:text-5xl'>
              الأسئلة <GradientText text='الشائعة' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h2>
          </div>

          <div className='max-w-3xl mx-auto space-y-4'>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className='border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300'
              >
                <button
                  type='button'
                  className='w-full px-6 py-4 text-right flex items-center justify-between focus:outline-none'
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className='text-base font-semibold text-gray-900'>{faq.question}</span>
                  <motion.svg
                    className='w-5 h-5 text-gray-500 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className='overflow-hidden'
                    >
                      <div className='px-6 pb-4'>
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className='text-sm text-gray-600 leading-relaxed text-right mb-3'
                        >
                          {faq.answer}
                        </motion.p>
                        {faq.id === 4 && (
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.2 }}
                            className='flex items-center gap-2 justify-end flex-wrap mt-3 mb-3'
                          >
                            {paymentImages.map((image, index) => (
                              <div
                                key={index}
                                className='relative w-12 h-8 sm:w-14 sm:h-9 flex-shrink-0'
                              >
                                <Image
                                  src={image}
                                  alt={`Payment method ${index + 1}`}
                                  fill
                                  className='object-contain'
                                  sizes='(max-width: 640px) 48px, 56px'
                                />
                              </div>
                            ))}
                          </motion.div>
                        )}
                        {faq.link && (
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2, delay: faq.id === 4 ? 0.3 : 0.2 }}
                            className='mt-4 flex justify-end'
                          >
                            <Link
                              href={faq.link}
                              className='inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-lg hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            >
                              {faq.linkText}
                              <svg
                                className='w-4 h-4 ml-2'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M15 19l-7-7 7-7'
                                />
                              </svg>
                            </Link>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='mt-16 sm:mt-20 lg:mt-24'
          >
            <motion.div
              className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              }}
            >
              <div className="relative z-10 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-5">
                  إذا لم يكن الآن، فمتى؟
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-7 max-w-3xl mx-auto">
                  ابدأ التعلم من دورات مسجلة <span className="font-bold">مفصلة خطوة بخطوة</span> يمكنك مشاهدتها في أي وقت. مع إمكانية التواصل مع المدربين والحصول على الدعم عند الحاجة. لا تنتظر، ابدأ اليوم
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-amber-900 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  أنشئ حسابك المجاني الآن
                </Link>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </motion.div>
          </motion.div>
      </div>
    </section>
  )
}

