'use client'

import { motion } from 'motion/react'

export function WhyUsVariantOne () {
  return (
    <section className='py-14 sm:py-16 lg:py-20 bg-gray-50'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='relative rounded-3xl p-[2px] bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'>
          <div className='relative bg-white rounded-3xl px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14'>
            <div className='grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className='text-right space-y-4'
              >
                <p className='text-sm font-medium text-yellow-600'>
                  لماذا تختار منصتنا التعليمية؟
                </p>

                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'>
                  ابدأ رحلتك نحو النجاح بخطوة التعلّم الصحيحة
                </h2>

                <p className='text-base leading-7 text-gray-700'>
                  ابدأ رحلتك نحو النجاح بخطوة التعلم الصحيحة، ونحن هنا لنجعلها سهلة وواضحة.
                  معنا، تتعلم في أي وقت وأي مكان، ونرشدك خطوة بخطوة من التعلّم إلى تطبيق المهارات.
                  نتابع تقدمك، نركز على التطبيق العملي الحقيقي، ونفتح لك فرص النجاح التي تستحقها… ✨ صدق… توصل.
                </p>

                <div className='grid gap-4 pt-4 text-sm text-gray-700 sm:grid-cols-3'>
                  <div className='rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 text-right'>
                    <p className='font-semibold text-yellow-600'>تعلم مرن</p>
                    <p>منصّة متاحة 24/7 في أي وقت وأي مكان يناسبك.</p>
                  </div>
                  <div className='rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 text-right'>
                    <p className='font-semibold text-yellow-600'>تطبيق عملي</p>
                    <p>تركيز على الجانب التطبيقي حتى تبدأ في تنفيذ ما تتعلّمه مباشرة.</p>
                  </div>
                  <div className='rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 text-right'>
                    <p className='font-semibold text-yellow-600'>مرافقة مستمرة</p>
                    <p>متابعة تقدّمك ودعم شخصي من المدربين والخبراء.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className='relative hidden lg:block'
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div className='relative w-full max-w-sm mx-auto'>
                  <div className='absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-yellow-300 via-yellow-400 to-yellow-500 opacity-60 blur-2xl' />
                  <div className='relative flex flex-col justify-between h-72 rounded-[2rem] border border-gray-100 bg-white shadow-[0_22px_60px_rgba(180,83,9,0.18)] p-5'>
                    <div className='h-32 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 flex items-center justify-center text-gray-400 text-xs text-center px-4'>
                      مساحة مخصصة للصورة الرئيسية
                      <br />
                      (ستُضاف من طرفك لاحقاً)
                    </div>
                    <div className='grid grid-cols-2 gap-3 text-xs text-gray-600'>
                      <div className='h-20 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 flex items-center justify-center text-center px-2'>
                        مساحة لصورة توضيحية 1
                      </div>
                      <div className='h-20 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 flex items-center justify-center text-center px-2'>
                        مساحة لصورة توضيحية 2
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


