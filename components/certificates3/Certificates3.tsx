'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'

const certificates = [
  {
    id: 1,
    title: 'شهادة مشاركة مجانية',
    description: 'احصل على شهادة مشاركة مجانية عند إكمال أي دورة تدريبية على المنصة',
    image: '/certificate/free certificate.png'
  },
  {
    id: 2,
    title: 'شهادة معترف بها وطنياً',
    description: 'شهادة معترف بها وطنياً تؤكد مهاراتك وتؤهلك للعمل في السوق المحلي',
    image: '/certificate/national certifcate.png'
  },
  {
    id: 3,
    title: 'شهادة معترف بها دولياً',
    description: 'شهادة معترف بها دولياً تفتح لك آفاق العمل والفرص على المستوى الدولي',
    image: '/certificate/internatinal certificate.png'
  }
]

export function Certificates3 () {
  const [selectedCertificate, setSelectedCertificate] = useState(2) // Start with certificate 2 selected
  
  const selectedCert = certificates.find(cert => cert.id === selectedCertificate) || certificates[1]
  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-white" dir="rtl" id="certificates">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            احصل على <GradientText text='شهادات معترف بها' gradient='linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' />
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base max-w-2xl mx-auto">
            نوفر لك ثلاثة أنواع من الشهادات التي يمكنك تحميلها من المنصة التعليمية وتعزز بها مسيرتك المهنية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content on the left (which appears on the right in RTL) */}
          <motion.div
            className="order-1 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="space-y-4 flex flex-col h-full justify-center">
              {certificates.map((certificate, index) => {
                const isHighlighted = certificate.id === selectedCertificate
                return (
                  <motion.div
                    key={certificate.id}
                    onClick={() => setSelectedCertificate(certificate.id)}
                    className={`rounded-xl p-4 sm:p-5 relative overflow-hidden cursor-pointer ${
                      isHighlighted
                        ? 'text-white shadow-xl'
                        : 'bg-white border-2 border-gray-100 text-gray-900 hover:border-amber-300 hover:shadow-lg'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence>
                      {isHighlighted && (
                        <motion.div 
                          className="absolute inset-0 rounded-xl z-0 bg-cover bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url('/bgs/gold metal.jpg')`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        />
                      )}
                    </AnimatePresence>
                    <div className="text-right relative z-10">
                      <h3 className={`text-base sm:text-lg font-bold mb-1.5 ${
                        isHighlighted ? 'text-white' : 'text-gray-900'
                      }`}>
                        {certificate.title}
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isHighlighted ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        {certificate.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Image on the right (which appears on the left in RTL) */}
          <motion.div
            className="order-2 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="relative w-full max-w-md mx-auto lg:max-w-lg aspect-[3/4] bg-transparent">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedCertificate}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="absolute inset-0 bg-transparent"
                >
                  <Image
                    src={selectedCert.image}
                    alt={selectedCert.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain rounded-lg drop-shadow-2xl bg-transparent"
                    priority={selectedCertificate === 2}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

