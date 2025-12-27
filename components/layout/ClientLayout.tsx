'use client'

import { usePathname } from 'next/navigation'
import { Header3 } from '@/components/header3/Header3'
import { Footer } from '@/components/footer/Footer'

export function ClientLayout ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isLogin = pathname === '/login'
  const isSignup = pathname === '/signup'
  const isHome = pathname === '/'

  return (
    <>
      {!isDashboard && !isLogin && !isSignup && !isHome && <Header3 />}
      {children}
      {!isDashboard && !isLogin && !isSignup && !isHome && <Footer />}
    </>
  )
}

