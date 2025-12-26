'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export function CtaSection3 () {
  return (
    <section id="cta" className="relative pt-0 pb-16 sm:pb-20 md:pb-24 lg:pb-28 bg-white" dir="rtl">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative z-10 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-5">
              جاهز لتغيير حياتك؟
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-7 max-w-3xl mx-auto">
              ابدأ رحلتك التعليمية اليوم مع <span className="font-bold">حساب مجاني</span> وافتح أبواب النجاح
            </p>
            <Link
              href="#cta"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm sm:text-base font-bold text-amber-900 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              أنشئ حسابك المجاني الآن
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </motion.div>
      </div>
    </section>
  )
}

