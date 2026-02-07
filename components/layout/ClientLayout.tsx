'use client'

import { usePathname } from 'next/navigation'
import { Header3 } from '@/components/header3/Header3'
import { Footer } from '@/components/footer/Footer'

export function ClientLayout ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isAdmin = pathname?.startsWith('/admin')
  const isLogin = pathname === '/login'
  const isSignup = pathname === '/signup'
  const isForgotPassword = pathname === '/forgot-password'
  const isHome = pathname === '/'
  const hideChrome = isDashboard || isAdmin || isLogin || isSignup || isForgotPassword || isHome

  return (
    <>
      {!hideChrome && <Header3 />}
      {children}
      {!hideChrome && <Footer />}
    </>
  )
}

