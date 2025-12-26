'use client'

import { motion } from 'motion/react'

export function WhyUsVariantTwo () {
  return (
    <section className='py-14 sm:py-16 lg:py-20 bg-white'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
          <motion.div
            className='order-2 lg:order-1'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className='relative w-full max-w-md mx-auto'>
              <div className='absolute -inset-5 rounded-[2rem] bg-gradient-to-tr from-yellow-200 via-yellow-400 to-yellow-500 opacity-60 blur-2xl' />
              <div className='relative rounded-[2rem] border border-gray-100 bg-gray-50/90 p-5 shadow-[0_18px_55px_rgba(180,83,9,0.18)]'>
                <div className='h-40 rounded-xl border border-dashed border-gray-200 bg-white/80 flex items-center justify-center text-center text-gray-400 text-xs px-4 mb-4'>
                  مساحة لصورة رئيسية كبيرة
                  <br />
                  (مثلاً: طالب يتعلّم عبر الحاسوب أو الهاتف)
                </div>
                <div className='grid grid-cols-3 gap-3 text-[11px] text-gray-600'>
                  <div className='h-16 rounded-lg border border-dashed border-gray-200 bg-white/90 flex items-center justify-center text-center px-2'>
                    مساحة لصورة صغيرة 1
                  </div>
                  <div className='h-16 rounded-lg border border-dashed border-gray-200 bg-white/90 flex items-center justify-center text-center px-2'>
                    مساحة لصورة صغيرة 2
                  </div>
                  <div className='h-16 rounded-lg border border-dashed border-gray-200 bg-white/90 flex items-center justify-center text-center px-2'>
                    مساحة لصورة صغيرة 3
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className='order-1 lg:order-2 text-right'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
          >
            <p className='text-sm font-medium text-yellow-600'>
              لماذا تختار منصتنا التعليمية؟
            </p>

            <h2 className='mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'>
              لأننا نرافقك خطوة بخطوة حتى تصل
            </h2>

            <p className='mt-4 text-base leading-7 text-gray-700'>
              ابدأ رحلتك نحو النجاح بخطوة التعلم الصحيحة، ونحن هنا لنجعلها سهلة وواضحة.
              معنا، تتعلم في أي وقت وأي مكان، ونرشدك خطوة بخطوة من التعلّم إلى تطبيق المهارات.
              نتابع تقدمك، نركز على التطبيق العملي الحقيقي، ونفتح لك فرص النجاح التي تستحقها… ✨ صدق… توصل.
            </p>

            <div className='mt-6 grid gap-4 sm:grid-cols-3 text-sm text-gray-700'>
              <div className='rounded-2xl bg-yellow-50 px-4 py-3 border border-yellow-100 text-right'>
                <p className='font-semibold text-yellow-700'>منصّة واضحة</p>
                <p>مسارات تعلم منظمة، حتى لا تضيع وقتك في البحث العشوائي.</p>
              </div>
              <div className='rounded-2xl bg-yellow-50 px-4 py-3 border border-yellow-100 text-right'>
                <p className='font-semibold text-yellow-700'>دعم حقيقي</p>
                <p>مرافقة من خبراء يساعدونك على تجاوز العقبات بسرعة.</p>
              </div>
              <div className='rounded-2xl bg-yellow-50 px-4 py-3 border border-yellow-100 text-right'>
                <p className='font-semibold text-yellow-700'>تركيز على النتائج</p>
                <p>هدفنا أن تصل إلى تطبيق حقيقي ومصدر دخل ملموس.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


