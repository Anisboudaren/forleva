'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { GradientText } from '@/components/text/gradient-text'
import { CheckCircle, UserPlus, BookOpen, Award, CreditCard, Sparkles, Users, ChevronLeft, ChevronRight } from 'lucide-react'

const steps = [
  {
    id: 1,
    title: 'أنشئ حساب مجاني',
    description: 'ابدأ رحلتك التعليمية من خلال إنشاء حساب مجاني على المنصة. العملية بسيطة وسريعة - ستحتاج فقط لبضع دقائق لإكمال التسجيل والوصول إلى جميع الدورات المتاحة.',
    expandedDescription: 'أنشئ حسابك في دقائق قليلة مجاناً تماماً. لا حاجة لبطاقة ائتمان أو أي رسوم مخفية. بمجرد التسجيل، ستحصل على وصول فوري إلى المنصة ويمكنك البدء في استكشاف الدورات المتاحة.',
    image: '/home page/sign up now.png',
    icon: UserPlus
  },
  {
    id: 2,
    title: 'اختر الدورات التي تريد المشاركة فيها',
    description: 'تصفح مجموعتنا الواسعة من الدورات التعليمية المتنوعة في مختلف المجالات. كل دورة مصممة بعناية لتوفر لك محتوى عالي الجودة ومهارات عملية قابلة للتطبيق.',
    expandedDescription: 'استكشف مئات الدورات في مجالات مختلفة مثل البرمجة، التصميم، التسويق الرقمي، ريادة الأعمال، واللغات. كل دورة تتضمن محتوى فيديو عالي الجودة، مواد تعليمية، وتمارين عملية لمساعدتك على إتقان المهارات.',
    image: '/home page/choose courses.png',
    icon: BookOpen
  },
  {
    id: 3,
    title: 'اختار الشهادة التي تريد التحصل عليها',
    description: 'اختر نوع الشهادة الذي يناسب أهدافك المهنية. نوفر ثلاثة أنواع من الشهادات: شهادة مشاركة مجانية، شهادة معترف بها وطنياً، وشهادة معترف بها دولياً.',
    expandedDescription: 'اختر من بين ثلاثة أنواع من الشهادات بناءً على احتياجاتك. الشهادة المجانية متاحة لكل الدورات، بينما الشهادات المعترف بها محلياً ودولياً تضيف قيمة كبيرة لسيرتك الذاتية وتمنحك ميزة تنافسية في سوق العمل.',
    image: '/home page/get certifcate.png',
    icon: Award
  },
  {
    id: 4,
    title: 'ادفع بطريقة الدفع التي تناسبك',
    description: 'نوفر لك عدة خيارات دفع مرنة وآمنة. يمكنك الدفع باستخدام بطاقات الائتمان، التحويل البنكي، أو أي طريقة دفع أخرى تناسبك. جميع المعاملات آمنة ومشفرة.',
    expandedDescription: 'نقدم خيارات دفع متعددة لراحتك. يمكنك الدفع باستخدام البطاقات الائتمانية والمدفوعة مسبقاً، التحويل البنكي المباشر، أو المحافظ الإلكترونية. جميع معاملاتك محمية بأعلى معايير الأمان والتشفير.',
    paymentImages: [
      '/how_to_use/dahbia pay .png',
      '/how_to_use/visa pay .png',
      '/how_to_use/mc pay .png',
      '/how_to_use/CIB pay .png'
    ],
    icon: CreditCard
  },
  {
    id: 5,
    title: 'مبروك! تم تفعيل الدورات في حسابك',
    description: 'بعد إتمام عملية الدفع، سيتم تفعيل جميع الدورات التي اخترتها فوراً في حسابك. يمكنك البدء في التعلم مباشرة والوصول إلى جميع المواد التعليمية.',
    expandedDescription: 'فور إتمام عملية الدفع، سيتم تفعيل جميع الدورات التي اخترتها في حسابك تلقائياً. ستحصل على وصول مدى الحياة لجميع المحتويات، ويمكنك التعلم في أي وقت ومن أي مكان. كل شيء منظم ومرتب لراحتك.',
    image: '/home page/get certifcate.png', // Will use success/completion visual
    icon: Sparkles
  },
  {
    id: 6,
    title: 'احصل على مرافقة ودعم من المدربين',
    description: 'لا تتعلم وحدك - ستحصل على دعم مستمر من فريق المدربين المحترفين. يمكنك طرح الأسئلة، الحصول على الإرشاد، والمتابعة مع المدربين خلال رحلتك التعليمية.',
    expandedDescription: 'نؤمن بأهمية الدعم الشخصي في رحلة التعلم. لذلك نوفر لك مرافقة مستمرة من فريق المدربين الخبراء. يمكنك التواصل معهم، طرح الأسئلة، الحصول على ملاحظات شخصية، والاستفادة من خبراتهم لتحقيق أقصى استفادة من الدورات.',
    image: '/how_to_use/support.png',
    icon: Users
  }
]

export default function HowItWorksPage () {
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0)

  const paymentImages = [
    '/how_to_use/dahbia pay .png',
    '/how_to_use/visa pay .png',
    '/how_to_use/mc pay .png',
    '/how_to_use/CIB pay .png'
  ]

  const nextPayment = () => {
    setCurrentPaymentIndex((prev) => (prev + 1) % paymentImages.length)
  }

  const prevPayment = () => {
    setCurrentPaymentIndex((prev) => (prev - 1 + paymentImages.length) % paymentImages.length)
  }

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

        {/* Image - Mobile: Full width, stick to top */}
        <div className="lg:hidden w-full pt-20 sm:pt-24">
          <Image
            src="/how_to_use/girl with tablet (2).png"
            alt="كيف تعمل المنصة"
            width={500}
            height={600}
            className="w-full h-auto"
            priority
          />
        </div>

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
                كيف تعمل{' '}
                <GradientText
                  text="المنصة"
                  gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
                  className="inline-block"
                />
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                رحلة بسيطة من ست خطوات لتبدأ رحلتك التعليمية وتحقق أهدافك المهنية. نرشدك خطوة بخطوة من التسجيل إلى إكمال الدورات والحصول على الشهادات.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-base text-gray-700 font-medium">
                    عملية بسيطة وسريعة
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-base text-gray-700 font-medium">
                    دعم مستمر من المدربين
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-base text-gray-700 font-medium">
                    شهادات معترف بها
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Image - Desktop */}
            <motion.div
              className="hidden lg:flex lg:order-2 lg:justify-end lg:items-start lg:pt-12"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="relative w-full max-w-md -mr-8 lg:-mr-12 xl:-mr-16">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src="/how_to_use/girl with tablet (2).png"
                    alt="كيف تعمل المنصة"
                    width={500}
                    height={600}
                    className="w-full h-auto"
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
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
              خطوات بسيطة لتبدأ
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              اتبع هذه الخطوات الست البسيطة وابدأ رحلتك التعليمية اليوم
            </p>
          </motion.div>

          <div className="space-y-16 sm:space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 1
              
              return (
                <motion.div
                  key={step.id}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                >
                  {/* Content */}
                  <div className={`text-right space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {step.id}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 border-r-4 border-amber-500">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {step.expandedDescription}
                      </p>
                    </div>

                    {/* Link for step 1 */}
                    {step.id === 1 && (
                      <div className="pt-2">
                        <Link 
                          href="/login"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                          style={{
                            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                          }}
                        >
                          يمكنك إنشاء حسابك من هنا
                          <UserPlus className="w-5 h-5" />
                        </Link>
                      </div>
                    )}

                    {/* Link for step 2 */}
                    {step.id === 2 && (
                      <div className="pt-2">
                        <Link 
                          href="/#choose-course"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                          style={{
                            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                          }}
                        >
                          يمكنك تعلم كيفية اختيار الدورة المناسبة من هنا
                          <BookOpen className="w-5 h-5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Image, Payment Carousel, or Lottie Animation */}
                  <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'} flex justify-center`}>
                    {step.id === 4 ? (
                      /* Payment Carousel */
                      <motion.div
                        className="relative w-full max-w-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-4">
                          {/* Carousel Container */}
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-50">
                            <motion.div
                              key={currentPaymentIndex}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0"
                            >
                              <Image
                                src={paymentImages[currentPaymentIndex]}
                                alt={`طريقة دفع ${currentPaymentIndex + 1}`}
                                fill
                                className="object-contain p-4"
                                sizes="(max-width: 768px) 100vw, 400px"
                              />
                            </motion.div>

                            {/* Navigation Buttons */}
                            <button
                              onClick={prevPayment}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
                              aria-label="السابق"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                              onClick={nextPayment}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
                              aria-label="التالي"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                              {paymentImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentPaymentIndex(idx)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentPaymentIndex
                                      ? 'bg-amber-600 w-6'
                                      : 'bg-gray-300 hover:bg-gray-400'
                                  }`}
                                  aria-label={`انتقل إلى طريقة الدفع ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Step number badge */}
                          <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {step.id}
                          </div>
                        </div>
                      </motion.div>
                    ) : step.id === 5 ? (
                      /* Lottie Animation for Step 5 */
                      <motion.div
                        className="relative w-full max-w-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-4">
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                            <DotLottieReact
                              src="https://lottie.host/64d50873-f94e-4608-aeaf-90d868b80daf/2tDWFp0dy5.lottie"
                              loop
                              autoplay
                              className="w-full h-full"
                            />
                          </div>
                          {/* Step number badge */}
                          <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {step.id}
                          </div>
                        </div>
                      </motion.div>
                    ) : step.image ? (
                      /* Regular Image */
                      <motion.div
                        className="relative w-full max-w-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          </div>
                          {/* Step number badge */}
                          <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {step.id}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
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
              جاهز للبدء؟
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              ابدأ رحلتك التعليمية اليوم مع <span className="font-bold">حساب مجاني</span> واتبع الخطوات البسيطة للوصول إلى أهدافك
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

