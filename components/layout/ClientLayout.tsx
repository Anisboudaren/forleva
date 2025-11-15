'use client'

import { usePathname } from 'next/navigation'
import { Header2 } from '@/components/header2/Header2'

export function ClientLayout ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <>
      {!isDashboard && <Header2 />}
      {children}
    </>
  )
}

