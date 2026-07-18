import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { SITE_SETTINGS_ID } from '@/lib/site-settings'

/** GET /api/admin/settings/site — admin-only, raw stored values (no defaults). */
export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: SITE_SETTINGS_ID },
    })
    return NextResponse.json({
      siteTitle: row?.siteTitle ?? '',
      siteDescription: row?.siteDescription ?? '',
      ogImageUrl: row?.ogImageUrl ?? null,
      ogImageKey: row?.ogImageKey ?? null,
      faviconUrl: row?.faviconUrl ?? null,
      faviconKey: row?.faviconKey ?? null,
      logoUrl: row?.logoUrl ?? null,
      logoKey: row?.logoKey ?? null,
    })
  } catch (e) {
    console.error('GET /api/admin/settings/site', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

function normStr(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null
}

export async function PATCH(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Body غير صالح' }, { status: 400 })
  }

  const data = {
    siteTitle: normStr(body.siteTitle),
    siteDescription: normStr(body.siteDescription),
    ogImageUrl: normStr(body.ogImageUrl),
    ogImageKey: normStr(body.ogImageKey),
    faviconUrl: normStr(body.faviconUrl),
    faviconKey: normStr(body.faviconKey),
    logoUrl: normStr(body.logoUrl),
    logoKey: normStr(body.logoKey),
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: { id: SITE_SETTINGS_ID, ...data },
      update: data,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('PATCH /api/admin/settings/site', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
