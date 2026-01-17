'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { User, Search, X } from 'lucide-react'
import { courses } from '@/components/popular-courses/PopularCourses'

export function Header3 () {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
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

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return courses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query)
    ).slice(0, 5) // Limit to 5 results
  }, [searchQuery])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
              <span className="relative z-10">دخول / تسجيل</span>
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
              className="lg:hidden mt-4 overflow-visible bg-white/95 backdrop-blur-md rounded-lg shadow-lg"
            >
              <motion.nav
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col space-y-1 p-4"
              >
                {/* Mobile Search */}
                <div ref={searchRef} className="mb-4 pb-4 border-b border-gray-200 relative z-50">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <input
                      type="text"
                      placeholder="ابحث عن دورة..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setIsSearchFocused(true)
                      }}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={(e) => {
                        // Don't close if clicking on dropdown
                        if (!searchRef.current?.contains(e.relatedTarget as Node)) {
                          setTimeout(() => setIsSearchFocused(false), 200)
                        }
                      }}
                      className="w-full pr-10 pl-4 py-2.5 text-sm text-right border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all bg-white relative z-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setIsSearchFocused(false)
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {isSearchFocused && searchQuery.trim() && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-80 overflow-y-auto z-[100]"
                        style={{ position: 'absolute' }}
                      >
                        {searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((course) => (
                              <Link
                                key={course.id}
                                href={`/courses/${course.id}`}
                                onClick={() => {
                                  setSearchQuery('')
                                  setIsSearchFocused(false)
                                  setIsMenuOpen(false)
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{course.instructor} • {course.category}</p>
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-amber-600">{course.price.toLocaleString()} د.ج</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            لا توجد نتائج
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                  دخول / تسجيل
                </Link>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
