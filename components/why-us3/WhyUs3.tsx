'use client'

import { motion } from 'motion/react'
import { GraduationCap, Clock, Target, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: GraduationCap,
    title: 'خطوة التعلم الصحيحة',
    description: 'ابدأ رحلتك نحو النجاح بخطوة التعلم الصحيحة، ونحن هنا لنجعلها سهلة وواضحة.'
  },
  {
    icon: Clock,
    title: 'تعلم في أي وقت وأي مكان',
    description: 'معنا، تتعلم في أي وقت وأي مكان، بحرية تامة ومرونة كاملة.'
  },
  {
    icon: Target,
    title: 'تطبيق عملي حقيقي',
    description: 'نرشدك خطوة بخطوة من التعلّم إلى تطبيق المهارات. نتابع تقدمك ونركز على التطبيق العملي الحقيقي.'
  },
  {
    icon: TrendingUp,
    title: 'فرص النجاح التي تستحقها',
    description: 'نفتح لك فرص النجاح التي تستحقها، ونرافقك في رحلتك نحو تحقيق أهدافك.'
  }
]

export function WhyUs3 () {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-white" dir="rtl" id="why-us">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            لماذا تختارنا؟
          </h2>
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            ابدأ رحلتك نحو النجاح بخطوة التعلم الصحيحة، ونحن هنا لنجعلها سهلة وواضحة.
            معنا، تتعلم في أي وقت وأي مكان، ونرشدك خطوة بخطوة من التعلّم إلى تطبيق المهارات. نتابع تقدمك، نركز على التطبيق العملي الحقيقي، ونفتح لك فرص النجاح التي تستحقها… ✨ صدق… توصل.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isSecondCard = index === 1
            
            return (
              <motion.div
                key={index}
                className={`group relative p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${
                  isSecondCard 
                    ? 'bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] border-amber-300/50 -ml-6 sm:-ml-8 mr-4 sm:mr-6 lg:mr-0 lg:-mt-8 lg:ml-0 lg:mb-8 rounded-r-2xl lg:rounded-2xl' 
                    : 'bg-white border-gray-100 hover:border-amber-200/50 rounded-2xl'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                whileHover={{ y: isSecondCard ? -15 : -5 }}
              >
                {/* Gold gradient border on hover - only for non-second cards */}
                {!isSecondCard && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-200/0 via-amber-300/0 to-amber-200/0 group-hover:from-amber-200/20 group-hover:via-amber-300/10 group-hover:to-amber-200/20 transition-all duration-300 -z-10 blur-xl" />
                )}
                
                {/* Icon */}
                <div className="relative mb-4 sm:mb-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 ${
                    isSecondCard
                      ? 'bg-white/90 group-hover:bg-white shadow-lg'
                      : 'bg-gradient-to-r from-amber-100 to-amber-50 group-hover:from-amber-200 group-hover:to-amber-100'
                  }`}>
                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-300 ${
                      isSecondCard 
                        ? 'text-amber-900 group-hover:text-amber-800' 
                        : 'text-amber-700 group-hover:text-amber-900'
                    }`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 transition-colors duration-300 ${
                  isSecondCard 
                    ? 'text-white group-hover:text-white/95' 
                    : 'text-gray-900 group-hover:text-amber-900'
                }`}>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className={`text-sm sm:text-base leading-relaxed ${
                  isSecondCard 
                    ? 'text-white/90' 
                    : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                {/* Decorative gold accent - only for non-second cards */}
                {!isSecondCard && (
                  <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-200/0 via-amber-300/0 to-amber-200/0 group-hover:from-amber-400 group-hover:via-amber-500 group-hover:to-amber-400 rounded-b-2xl transition-all duration-300" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
