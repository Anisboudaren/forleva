import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { getSiteSettings } from '@/lib/site-settings'

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

// Read site settings (title/description/favicon/OG) fresh so admin changes always apply.
export const dynamic = 'force-dynamic'

export async function generateMetadata (): Promise<Metadata> {
  const settings = await getSiteSettings()

  const icon = settings.faviconUrl
    ? [{ url: settings.faviconUrl }]
    : [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
        { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      ]

  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
    icons: {
      icon,
      shortcut: settings.faviconUrl ?? '/favicon.ico',
      apple: '/apple-icon.png',
    },
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
  }
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
