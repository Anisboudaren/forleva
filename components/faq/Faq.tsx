'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GradientText } from '@/components/text/gradient-text'

const faqs = [
  {
    id: 1,
    question: 'س١ : كيف يمكنني التسجيل في الدورات؟',
    answer:
      'يمكنك التسجيل بسهولة من خلال إنشاء حساب مجاني على المنصة التعليمية، ثم تصفح الدورات المتاحة واختيار ما يناسبك. يمكنك الدفع عبر طرق متعددة آمنة، مباشرة بعدها يتم تفعيل دورتك على حسابك في المنصة التعليمية.'
  },
  {
    id: 2,
    question: 'س٢ : هل تبقى الدورات مسجلة عندي؟',
    answer:
      'نعم أكيد، تبقى الدورات مسجلة عندك في حسابك على المنصة التعليمية لمدة عام كامل ابتداءً من تاريخ تفعيل الدورات، لمشاهدتها وقت ما يناسبك.'
  },
  {
    id: 3,
    question: 'س٣ : هل يمكنني تجديد الاشتراك بعد انتهاء العام الأول؟',
    answer: 'نعم أكيد، يمكنك تجديد الاشتراك في أي دورة تريدها بعد انتهاء مدة الاشتراك الأولى.'
  },
  {
    id: 4,
    question: 'س٤ : ما هي طرق الدفع المتاحة؟',
    answer:
      'يوجد العديد من طرق الدفع المتاحة، يمكنك اختيار ما يناسبك: CCP، BARIDIMOB، CIB، Visa Card، Master Card، PayPal.'
  },
  {
    id: 5,
    question: 'س٥ : ما هي أنواع الشهادات التي تقدمونها؟',
    answer:
      'نقدم ثلاثة أنواع من الشهادات باسمك يمكنك تحميلها من المنصة التعليمية: شهادة مشاركة مجانية، شهادة معترف بها وطنياً مدفوعة، شهادة معترف بها دولياً مدفوعة.'
  },
  {
    id: 6,
    question: 'س٦ : هل التكوين مناسب للمبتدئين؟',
    answer:
      'نعم، الشرح والتطبيق بالتفصيل خطوة بخطوة، مناسب حتى لو ما عندك أي خبرة سابقة.'
  },
  {
    id: 7,
    question: 'س٧ : هل هنالك دعم ومتابعة بعد الاشتراك في الدورات؟',
    answer:
      'نعم أكيد، يتحصل كل مشارك(ة) في أي دورة على متابعة ومرافقة شخصية من طرف المدرب.'
  },
  {
    id: 8,
    question: 'س٨ : هل في الدورات على المنصة نتعلم الجانب التطبيقي أم فقط النظري؟',
    answer:
      'الدورات على المنصة التعليمية مركزة على التطبيق العملي، كل دورة فيها تعليم نظري وتطبيقي حتى تتمكن من التطبيق مباشرة على أرض الواقع وتكتسب خبرة حقيقية.'
  },
  {
    id: 9,
    question: 'س٩ : هل يمكنني التواصل مع المدربين؟',
    answer:
      'يمكنك التواصل مع المدربين عبر المنصة التعليمية من خلال رسائل مباشرة، ومعظم المدربين يردون خلال 24 ساعة.'
  },
  {
    id: 10,
    question: 'س١٠ : هل تساعدني المنصة إذا أردت بدء مشروعي الشخصي؟',
    answer:
      'نعم، تساعدك المنصة التعليمية على تحقيق فكرة مشروعك حتى تجسدها على أرض الواقع عن طريق تقديم دعم ومرافقة مدفوعة من طرف خبراء.'
  },
  {
    id: 11,
    question: 'س١١ : هل يمكنني استرداد المبلغ إذا لم تعجبني الدورة؟',
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

