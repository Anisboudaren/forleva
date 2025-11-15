'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GradientText } from '@/components/text/gradient-text'

const faqs = [
  {
    id: 1,
    question: 'كيف يمكنني التسجيل في الدورات؟',
    answer: 'يمكنك التسجيل بسهولة من خلال إنشاء حساب مجاني على المنصة، ثم تصفح الدورات المتاحة واختيار ما يناسبك. يمكنك الدفع عبر طرق متعددة آمنة.'
  },
  {
    id: 2,
    question: 'هل يمكنني الوصول للدورات بعد انتهائها؟',
    answer: 'نعم، بمجرد التسجيل في أي دورة، ستحصل على وصول مدى الحياة للمحتوى. يمكنك مراجعة الدروس في أي وقت ومن أي مكان.'
  },
  {
    id: 3,
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'نقبل الدفع عبر البطاقات الائتمانية، التحويل البنكي، والدفع عند الاستلام في بعض المناطق. جميع المعاملات آمنة ومشفرة.'
  },
  {
    id: 4,
    question: 'هل توجد شهادات إتمام للدورات؟',
    answer: 'نعم، بعد إتمام أي دورة بنجاح، ستحصل على شهادة إتمام معتمدة يمكنك مشاركتها على LinkedIn أو إضافتها لسيرتك الذاتية.'
  },
  {
    id: 5,
    question: 'كيف يمكنني التواصل مع المدربين؟',
    answer: 'يمكنك التواصل مع المدربين من خلال منتدى المنصة أو عبر نظام الرسائل المباشرة. معظم المدربين يردون خلال 24 ساعة.'
  },
  {
    id: 6,
    question: 'هل يمكنني استرداد المبلغ إذا لم يعجبني الدورة؟',
    answer: 'نعم، نقدم ضمان استرداد المبلغ خلال 30 يوماً من تاريخ الشراء إذا لم تكن راضياً عن المحتوى لأي سبب.'
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
        <div className='max-w-3xl mx-auto'>
          <div className='text-center mb-12 max-w-md mx-auto sm:max-w-lg'>
            <p className='text-lg font-medium text-gray-600'>
              إجابات على الأسئلة الأكثر شيوعاً
            </p>
            <h2 className='mt-2 sm:mt-4 text-[22px] font-bold text-gray-900 sm:text-4xl xl:text-5xl'>
              الأسئلة <GradientText text='الشائعة' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
            </h2>
          </div>

          <div className='space-y-4'>
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
                          className='text-sm text-gray-600 leading-relaxed text-right'
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

