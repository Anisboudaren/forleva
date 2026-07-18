import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/site-settings'

/** Public API: site branding used by the client navbar (no auth). */
export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({
      siteTitle: settings.siteTitle,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
    })
  } catch (e) {
    console.error('GET /api/site-settings', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
