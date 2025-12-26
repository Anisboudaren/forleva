'use client'

import { motion } from 'motion/react'

export function WhyUsVariantThree () {
  return (
    <section className='py-14 sm:py-16 lg:py-20 bg-gray-50'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.06)]'>
          <div className='absolute inset-x-0 -top-24 h-40 bg-gradient-to-r from-yellow-200/40 via-yellow-400/35 to-yellow-500/30 blur-3xl pointer-events-none' />

          <div className='relative grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:gap-14 lg:px-14 lg:py-14'>
            <motion.div
              className='text-right'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <p className='text-sm font-medium text-yellow-600'>
                لماذا تختار منصتنا التعليمية؟
              </p>

              <h2 className='mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'>
                تعلّم واضح، تطبيق حقيقي، و مرافقة في كل خطوة
              </h2>

              <p className='mt-4 text-base leading-7 text-gray-700'>
                ابدأ رحلتك نحو النجاح بخطوة التعلم الصحيحة، ونحن هنا لنجعلها سهلة وواضحة.
                معنا، تتعلم في أي وقت وأي مكان، ونرشدك خطوة بخطوة من التعلّم إلى تطبيق المهارات.
                نتابع تقدمك، نركز على التطبيق العملي الحقيقي، ونفتح لك فرص النجاح التي تستحقها… ✨ صدق… توصل.
              </p>

              <div className='mt-6 grid gap-4 sm:grid-cols-3 text-sm text-gray-700'>
                <div className='rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 text-right'>
                  <p className='font-semibold text-gray-900'>تعلم في وقتك</p>
                  <p>محتوى مسجل يمكنك مشاهدته متى شئت، مع تحديثات مستمرة.</p>
                </div>
                <div className='rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 text-right'>
                  <p className='font-semibold text-gray-900'>متابعة و قياس</p>
                  <p>نساعدك على متابعة تقدّمك ومعرفة أين وصلت بالضبط.</p>
                </div>
                <div className='rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 text-right'>
                  <p className='font-semibold text-gray-900'>فرص حقيقية</p>
                  <p>نربط بين مهاراتك الجديدة وفرص حقيقية لبدء مشروعك أو عملك الحر.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className='relative'
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            >
              <div className='relative w-full max-w-md mx-auto'>
                <div className='h-40 rounded-2xl border border-dashed border-gray-200 bg-gray-50/90 flex items-center justify-center text-center text-gray-400 text-xs px-4 mb-4'>
                  مساحة لصورة توضح رحلة المتعلّم
                  <br />
                  (مثلاً: مسار من التعلّم إلى تحقيق الدخل)
                </div>

                <div className='grid grid-cols-2 gap-3 text-[11px] text-gray-600'>
                  <div className='h-20 rounded-xl border border-dashed border-gray-200 bg-gray-50/90 flex items-center justify-center text-center px-2'>
                    مساحة لصورة توضيحية لمسار التعلّم
                  </div>
                  <div className='h-20 rounded-xl border border-dashed border-gray-200 bg-gray-50/90 flex items-center justify-center text-center px-2'>
                    مساحة لصورة توضيحية لنتائج الطلاب
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}


