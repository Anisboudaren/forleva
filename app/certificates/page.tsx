'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { Award, Globe, FileCheck, CheckCircle, UserPlus, CreditCard, Package } from 'lucide-react'

const certificateTypes = [
  {
    id: 1,
    title: 'شهادة مشاركة مجانية',
    description: 'احصل على شهادة مشاركة مجانية عند إكمال أي دورة تدريبية على المنصة. هذه الشهادة تؤكد مشاركتك وإتمامك للدورة بنجاح.',
    image: '/certificate/free certificate.png',
    icon: FileCheck,
    features: [
      'مجانية تماماً',
      'متاحة لكل الدورات',
      'تأكيد المشاركة',
      'قابلة للتحميل'
    ]
  },
  {
    id: 2,
    title: 'شهادة معترف بها وطنياً',
    description: 'شهادة معترف بها وطنياً تؤكد مهاراتك وتؤهلك للعمل في السوق المحلي. هذه الشهادة تضيف قيمة حقيقية لسيرتك الذاتية.',
    image: '/certificate/national certifcate.png',
    icon: Award,
    features: [
      'معترف بها محلياً',
      'تعزز فرص العمل',
      'قيمة مضافة للسيرة',
      'مصداقية عالية'
    ]
  },
  {
    id: 3,
    title: 'شهادة معترف بها دولياً',
    description: 'شهادة معترف بها دولياً تفتح لك آفاق العمل والفرص على المستوى الدولي. شهادة بمعايير عالمية تعزز مكانتك المهنية.',
    image: '/certificate/internatinal certificate.png',
    icon: Globe,
    features: [
      'معترف بها عالمياً',
      'فتح آفاق دولية',
      'معايير عالمية',
      'قيمة استثنائية'
    ]
  }
]

export default function CertificatesPage () {
  return (
    <div className="overflow-x-hidden bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative pb-8 sm:pb-12 md:pb-16 lg:pb-20 pt-0 lg:pt-24">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 via-white to-white -z-10" />
        <div className="absolute inset-0 opacity-[0.02] -z-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Video - Mobile: Full width, stick to top */}
        <motion.div
          className="lg:hidden w-full pt-20 sm:pt-24 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/BLh6NiuV7b8"
              title="شرح الشهادات المتاحة"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-center text-sm sm:text-base text-gray-600 font-medium">
            شاهد هذا الفيديو لمعرفة المزيد عن الشهادات المتاحة وكيفية الحصول عليها
          </p>
        </motion.div>

        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-8 lg:pt-0">
            {/* Content */}
            <motion.div
              className="text-right space-y-6 order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                احصل على{' '}
                <GradientText
                  text="شهادات معترف بها"
                  gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
                  className="inline-block"
                />
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                نوفر لك ثلاثة أنواع من الشهادات التي يمكنك تحميلها من المنصة التعليمية وتعزز بها مسيرتك المهنية
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-base text-gray-700 font-medium">
                    اختر الدورات التي تريد المشاركة فيها
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-base text-gray-700 font-medium">
                    اختار الشهادة التي تريد التحصل عليها
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Video - Desktop */}
            <motion.div
              className="hidden lg:flex lg:order-2 lg:justify-end lg:items-start lg:pt-12"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="relative w-full max-w-2xl">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-gray-900">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/BLh6NiuV7b8"
                    title="شرح الشهادات المتاحة"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="mt-4 text-center text-sm text-gray-600 font-medium">
                  شاهد هذا الفيديو لمعرفة المزيد عن الشهادات المتاحة وكيفية الحصول عليها
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificate Types Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              أنواع الشهادات المتاحة
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              اكتشف أنواع الشهادات المختلفة واختر ما يناسب احتياجاتك وأهدافك المهنية
            </p>
          </motion.div>

          <div className="space-y-16 sm:space-y-20">
            {certificateTypes.map((certificate, index) => {
              const Icon = certificate.icon
              const isEven = index % 2 === 1
              
              return (
                <motion.div
                  key={certificate.id}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                >
                  {/* Content */}
                  <div className={`text-right space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-full">
                        <Icon className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-900">
                          {certificate.title}
                        </span>
                      </div>
                      {certificate.id === 2 || certificate.id === 3 ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                          <CreditCard className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-700">
                            مدفوعة
                          </span>
                        </div>
                      ) : null}
                      {certificate.id === 3 ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">
                            نسخة مطبوعة فقط
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {certificate.title}
                    </h3>

                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      {certificate.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                      {certificate.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image */}
                  <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'} flex justify-center`}>
                    <motion.div
                      className="relative w-full max-w-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
                        <Image
                          src={certificate.image}
                          alt={certificate.title}
                          width={600}
                          height={800}
                          className="w-full h-auto"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 to-white">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8 text-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              ابدأ رحلتك التعليمية الآن
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              ابدأ رحلتك التعليمية اليوم مع <span className="font-bold">حساب مجاني</span> وافتح أبواب النجاح
            </p>
            <div className="pt-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                style={{
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                }}
              >
                <UserPlus className="w-5 h-5" />
                أنشئ حسابك المجاني الآن
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

