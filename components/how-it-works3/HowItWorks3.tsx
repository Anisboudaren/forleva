'use client'

import { motion } from 'motion/react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const steps = [
  {
    image: '/home page/sign up now.png',
    title: 'سجل في المنصة',
    description: 'أنشئ حسابك مجاناً في دقائق قليلة وابدأ رحلتك التعليمية'
  },
  {
    image: '/home page/choose courses.png',
    title: 'اختر الدورة المناسبة',
    description: 'استكشف مجموعة واسعة من الدورات واختر ما يناسب أهدافك ومهاراتك'
  },
  {
    image: '/home page/get certifcate.png',
    title: 'احصل على شهادتك',
    description: 'أكمل الدورة بنجاح واحصل على شهادة معتمدة تثبت مهاراتك الجديدة'
  }
]

export function HowItWorks3 () {
  const [activeStep, setActiveStep] = useState(0)
  const [waveProgress, setWaveProgress] = useState(0) // 0-100% for wave animation
  const isVisibleRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const section = document.getElementById('how-it-works')
    if (!section) return

    let intervalId: NodeJS.Timeout | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisibleRef.current = true
          
          // Start wave animation cycle
          const startWaveCycle = () => {
            setWaveProgress(0)
            let currentProgress = 0
            
            const animateWave = () => {
              if (!isVisibleRef.current) return
              
              currentProgress += 1.5 // Increment by 1.5% per frame
              if (currentProgress >= 100) {
                setWaveProgress(100)
                // Wave complete, move to next step after a brief pause
                setTimeout(() => {
                  if (isVisibleRef.current) {
                    setActiveStep((prev) => (prev + 1) % steps.length)
                  }
                }, 500)
                return
              }
              
              setWaveProgress(currentProgress)
              animationFrameRef.current = setTimeout(animateWave, 25) as unknown as number
            }
            animateWave()
          }
          
          startWaveCycle()
          
          // Cycle through steps
          if (!intervalId) {
            intervalId = setInterval(() => {
              if (isVisibleRef.current) {
                startWaveCycle()
              }
            }, 5000)
          }
        } else {
          isVisibleRef.current = false
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          if (animationFrameRef.current) {
            clearTimeout(animationFrameRef.current)
            animationFrameRef.current = null
          }
          setWaveProgress(0)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(section)

    return () => {
      observer.unobserve(section)
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current)
      }
      isVisibleRef.current = false
    }
  }, [])

  // Calculate wave position for current section (0-100% of entire line)
  const getWavePosition = () => {
    let position = 0
    if (activeStep === 0) {
      position = 33.33 * (waveProgress / 100) // 0% to 33.33%
    } else if (activeStep === 1) {
      position = 33.33 + (33.33 * (waveProgress / 100)) // 33.33% to 66.66%
    } else {
      position = 66.66 + (33.33 * (waveProgress / 100)) // 66.66% to 100%
    }
    // Round to prevent hydration issues
    return Math.round(position * 100) / 100
  }

  // Render snake path dots for desktop (RTL: right to left)
  const renderDesktopSnakePath = (startStep: number, endStep: number, dotCount: number) => {
    // For RTL, we reverse the positions: step 1 is at 100%, step 2 at 50%, step 3 at 0%
    const startPercent = startStep === 0 ? 100 : startStep === 1 ? 50 : 0
    const endPercent = endStep === 1 ? 50 : 0
    
    return [...Array(dotCount)].map((_, i) => {
      const progress = i / (dotCount - 1)
      // Reverse progress for RTL (go from right to left)
      const reversedProgress = 1 - progress
      const containerPercent = Math.round((endPercent + (startPercent - endPercent) * reversedProgress) * 100) / 100
      
      // Snake shape: y varies in a wave pattern (rounded to prevent hydration issues)
      // Align with step circles which are staggered (step 1 up, step 2 down, step 3 up)
      // Base position aligns with the middle of step circles (moved higher)
      const baseY = 15 // Base position aligned with step circles (higher)
      const waveOffset = Math.round(Math.sin(progress * Math.PI * 4) * 12 * 100) / 100
      // Add slight adjustment for path direction
      const pathAdjustment = startStep === 0 ? 0 : -5 // Slight downward adjustment for path 2
      const y = Math.round((baseY + waveOffset + pathAdjustment) * 100) / 100
      
      // Check if wave has reached this dot (RTL: wave moves from right to left)
      // For RTL, wave starts at 100% and moves to 0%
      let isReached = false
      let isInWave = false
      
      if (activeStep === startStep) {
        // Wave is currently animating through this path (RTL direction)
        // Calculate wave position on this path: 100% to 0% of path length (reversed)
        const wavePositionOnPath = (waveProgress / 100) * (startPercent - endPercent) // path length
        const wavePositionOnContainer = startPercent - wavePositionOnPath // actual container position (right to left)
        
        // For RTL, wave reaches dots when it's greater than or equal to their position
        isReached = wavePositionOnContainer <= containerPercent + 2
        isInWave = Math.abs(wavePositionOnContainer - containerPercent) < 4
      } else if (activeStep > startStep) {
        // This path has already been completed
        isReached = true
      }
      
      return (
        <motion.div
          key={`desktop-${startStep}-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            zIndex: 0,
            right: `${containerPercent}%`,
            top: `${y}%`,
            marginRight: '-3px',
            marginTop: '-3px',
            background: isReached
              ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              : '#e5e7eb'
          }}
          animate={{
            scale: isInWave ? [1, 1.5, 1] : isReached ? 1 : 0.8,
            opacity: isInWave ? 1 : isReached ? 0.9 : 0.3
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
        />
      )
    })
  }

  // Render snake path dots for mobile
  const renderMobileSnakePath = (startStep: number, endStep: number, dotCount: number) => {
    const startYPercent = startStep === 0 ? 0 : startStep === 1 ? 33.33 : 66.66
    const endYPercent = startStep === 0 ? 33.33 : startStep === 1 ? 66.66 : 100
    
    // Calculate corresponding horizontal position for wave check
    const startXPercent = startStep === 0 ? 0 : startStep === 1 ? 50 : 100
    const endXPercent = startStep === 0 ? 50 : startStep === 1 ? 100 : 100
    
    return [...Array(dotCount)].map((_, i) => {
      const progress = i / (dotCount - 1)
      // Round to 2 decimal places to prevent hydration mismatch
      const yPercent = Math.round((startYPercent + (endYPercent - startYPercent) * progress) * 100) / 100
      
      // Snake shape: x varies in a wave pattern (rounded)
      const waveOffset = Math.round(Math.sin(progress * Math.PI * 4 + (startStep === 0 ? 0 : Math.PI)) * 20 * 100) / 100
      const x = Math.round(waveOffset * 100) / 100
      
      // Check if wave has reached this dot
      // Path 1: connects step 1 to step 2 - activates when activeStep is 0
      // Path 2: connects step 2 to step 3 - activates when activeStep is 1
      const containerPercent = Math.round((startXPercent + (endXPercent - startXPercent) * progress) * 100) / 100
      
      let isReached = false
      let isInWave = false
      
      if (startStep === 0 && activeStep === 0) {
        // Path 1: wave moves from 0% to 50% as waveProgress goes 0-100%
        const pathPosition = (waveProgress / 100) * 50 // 0 to 50
        isReached = pathPosition >= containerPercent - 3
        isInWave = Math.abs(pathPosition - containerPercent) < 5
      } else if (startStep === 1 && activeStep === 1) {
        // Path 2: wave moves from 50% to 100% as waveProgress goes 0-100%
        const pathPosition = 50 + ((waveProgress / 100) * 50) // 50 to 100
        isReached = pathPosition >= containerPercent - 3
        isInWave = Math.abs(pathPosition - containerPercent) < 5
      } else if (activeStep > startStep) {
        // Path is already completed
        isReached = true
      }
      
      return (
        <motion.div
          key={`mobile-${startStep}-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            zIndex: 0,
            top: `${yPercent}%`,
            left: `calc(50% + ${x}px)`,
            marginLeft: '-3px',
            marginTop: '-3px',
            background: isReached
              ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              : '#e5e7eb'
          }}
          animate={{
            scale: isInWave ? [1, 1.5, 1] : isReached ? 1 : 0.8,
            opacity: isInWave ? 1 : isReached ? 0.9 : 0.3
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
        />
      )
    })
  }

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-white" dir="rtl">
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
            كيف تعمل المنصة
          </h2>
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            رحلة بسيطة من ثلاث خطوات لتبدأ رحلتك التعليمية وتحقق أهدافك
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start relative" style={{ zIndex: 10 }}>
            {steps.map((step, index) => {
              // Stagger circles in zigzag pattern
              const verticalOffset = index === 0 ? '-mt-4' : index === 1 ? 'mt-10' : '-mt-4'
              
              // Add extra padding between step 2 and 3 on mobile only
              const mobileSpacing = index === 2 ? 'mt-16 md:mt-0' : ''
              
              // Steps are always gold
              const isActive = activeStep === index

              return (
                <motion.div
                  key={index}
                  className={`relative flex flex-col items-center text-center ${verticalOffset} ${mobileSpacing}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  {/* Large Background Number - Alternating Left/Right */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 z-0 ${
                      index % 2 === 0 ? 'left-0' : 'right-0'
                    }`}
                    style={{ 
                      fontSize: 'clamp(160px, 25vw, 280px)',
                      lineHeight: 1,
                      opacity: 0.15,
                      fontWeight: 900,
                      color: '#fbbf24'
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Round Image with Gold Border */}
                  <div className="relative mb-6 z-10">
                    {/* Round Image with Gold Border */}
                    <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full p-1.5 shadow-lg transition-all duration-300"
                      style={{
                        background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                      }}
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 160px, (max-width: 768px) 176px, 192px"
                        />
                      </div>
                      
                      {/* Pulse animation for active step */}
                      {isActive && (
                        <motion.div
                          className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] opacity-30 -z-10"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 transition-colors duration-300 relative inline-block px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
                      {step.title}
                    </h3>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Desktop: Snake Paths with Dots */}
          <div className="hidden md:block absolute top-12 left-0 right-0" style={{ height: '120px', zIndex: 0 }}>
            <div className="relative h-full">
              {/* Path 1: Step 1 to Step 2 */}
              <div className="absolute inset-0">
                {renderDesktopSnakePath(0, 1, 20)}
              </div>

              {/* Path 2: Step 2 to Step 3 */}
              <div className="absolute inset-0">
                {renderDesktopSnakePath(1, 2, 20)}
              </div>
            </div>
          </div>

          {/* Mobile: Snake Paths with Dots */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0" style={{ width: '4px', transform: 'translateX(-50%)', marginTop: '80px', marginBottom: '20px', zIndex: 0 }}>
            <div className="relative h-full">
              {/* Path 1: Step 1 to Step 2 */}
              <div className="absolute inset-0">
                {renderMobileSnakePath(0, 1, 15)}
              </div>

              {/* Path 2: Step 2 to Step 3 */}
              <div className="absolute inset-0">
                {renderMobileSnakePath(1, 2, 15)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
