'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { User } from 'lucide-react'

export function Header3 () {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isCertificatesPage = pathname === '/certificates'
  const isHowItWorksPage = pathname === '/how-it-works'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Only determine active section if on home page
      if (isHomePage) {
        const sections = ['hero', 'how-it-works', 'choose-course', 'courses', 'certificates', 'cta']
        const scrollPosition = window.scrollY + 100
        
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = document.getElementById(sections[i])
          if (section && section.offsetTop <= scrollPosition) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  function toggleMenu () {
    setIsMenuOpen(!isMenuOpen)
  }

  const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (isHomePage) {
      e.preventDefault()
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    // If not on home page, let the Link component handle navigation normally
    setIsMenuOpen(false)
  }

  // Helper to get href for navigation links
  const getNavHref = (sectionId: string) => {
    // Certificates and how-it-works have dedicated pages, link to them instead
    if (sectionId === 'certificates') {
      return '/certificates'
    }
    if (sectionId === 'how-it-works') {
      return '/how-it-works'
    }
    return isHomePage ? `#${sectionId}` : `/#${sectionId}`
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 py-4 md:py-6 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
          : 'bg-transparent'
      }`}
      dir="rtl"
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-4">
          {/* Logo on the far right (RTL) */}
          <div className="flex-shrink-0 order-last">
            <Link
              href="/"
              title="Forleva"
              className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
            >
              <Image
                className="w-auto h-12 lg:h-16 transition-opacity duration-300"
                src="/logo with brand name (black colored ).png"
                alt="Forleva Logo"
                width={300}
                height={120}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:absolute lg:inset-y-0 lg:flex lg:items-center lg:justify-center lg:w-full lg:pointer-events-none">
            <nav className="flex items-center gap-6 lg:gap-8 pointer-events-auto">
              <Link
                href={getNavHref('how-it-works')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-offset-2 whitespace-nowrap text-gray-900 hover:text-gray-600 focus:ring-gray-900 group ${
                  isHowItWorksPage || (isHomePage && activeSection === 'how-it-works')
                    ? 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:transition-all after:duration-300' 
                    : 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:scale-x-0 after:transition-transform after:duration-300 after:origin-center group-hover:after:scale-x-100'
                }`}
              >
                كيف تعمل المنصة
              </Link>

              <Link
                href={getNavHref('choose-course')}
                onClick={(e) => smoothScrollTo(e, 'choose-course')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-offset-2 whitespace-nowrap text-gray-900 hover:text-gray-600 focus:ring-gray-900 group ${
                  isHomePage && activeSection === 'choose-course' 
                    ? 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:transition-all after:duration-300' 
                    : 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:scale-x-0 after:transition-transform after:duration-300 after:origin-center group-hover:after:scale-x-100'
                }`}
              >
                كيف تختار الدورة المناسبة
              </Link>

              <Link
                href={getNavHref('courses')}
                onClick={(e) => smoothScrollTo(e, 'courses')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-offset-2 whitespace-nowrap text-gray-900 hover:text-gray-600 focus:ring-gray-900 group ${
                  isHomePage && activeSection === 'courses' 
                    ? 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:transition-all after:duration-300' 
                    : 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:scale-x-0 after:transition-transform after:duration-300 after:origin-center group-hover:after:scale-x-100'
                }`}
              >
                الدورات
              </Link>

              <Link
                href={getNavHref('certificates')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-offset-2 whitespace-nowrap text-gray-900 hover:text-gray-600 focus:ring-gray-900 group ${
                  isCertificatesPage
                    ? 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:transition-all after:duration-300'
                    : 'after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#fbbf24] after:via-[#f59e0b] after:to-[#d97706] after:scale-x-0 after:transition-transform after:duration-300 after:origin-center group-hover:after:scale-x-100'
                }`}
              >
                شهادات
              </Link>
            </nav>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex lg:items-center lg:ml-auto">
            <Link
              href="/login"
              className="relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 whitespace-nowrap overflow-hidden group"
              style={{
                background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              }}
            >
              <User className="w-4 h-4 relative z-10" />
              <span className="relative z-10">أنشئ ملفك الشخصي</span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="transition-all duration-200 p-2 rounded-md text-gray-900"
              onClick={toggleMenu}
              aria-label="تبديل القائمة"
            >
              {isMenuOpen ? (
                <svg
                  className="w-7 h-7"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden mt-4 overflow-hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg"
            >
              <motion.nav
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col space-y-1 p-4"
              >
                <Link
                  href={getNavHref('how-it-works')}
                  className={`text-base font-medium transition-all duration-200 rounded px-3 py-2 ${
                    isHowItWorksPage
                      ? 'text-amber-600 bg-amber-50 font-semibold'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  كيف تعمل المنصة
                </Link>

                <Link
                  href={getNavHref('choose-course')}
                  onClick={(e) => smoothScrollTo(e, 'choose-course')}
                  className="text-base font-medium text-gray-900 transition-all duration-200 rounded px-3 py-2 hover:bg-gray-100"
                >
                  كيف تختار الدورة المناسبة
                </Link>

                <Link
                  href={getNavHref('courses')}
                  onClick={(e) => smoothScrollTo(e, 'courses')}
                  className="text-base font-medium text-gray-900 transition-all duration-200 rounded px-3 py-2 hover:bg-gray-100"
                >
                  الدورات
                </Link>

                <Link
                  href={getNavHref('certificates')}
                  className={`text-base font-medium transition-all duration-200 rounded px-3 py-2 ${
                    isCertificatesPage
                      ? 'text-amber-600 bg-amber-50 font-semibold'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  شهادات
                </Link>

                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200"
                  style={{
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                  }}
                >
                  <User className="w-4 h-4" />
                  أنشئ ملفك الشخصي
                </Link>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
