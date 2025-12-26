'use client'

import { usePathname } from 'next/navigation'
import { Header2 } from '@/components/header2/Header2'
import { Footer } from '@/components/footer/Footer'

export function ClientLayout ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isLogin = pathname === '/login'
  const isHome = pathname === '/'

  return (
    <>
      {!isDashboard && !isLogin && !isHome && <Header2 />}
      {children}
      {!isDashboard && !isLogin && !isHome && <Footer />}
    </>
  )
}

