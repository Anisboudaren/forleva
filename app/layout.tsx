import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: 'Forleva',
  description: 'منصة تعليمية اجتماعية للمتعلمين',
  icons: {
    icon: '/logo alone gold.png',
    shortcut: '/logo alone gold.png',
    apple: '/logo alone gold.png',
  },
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ar' dir='rtl'>
      <body
        className={`${cairo.variable} font-sans antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
