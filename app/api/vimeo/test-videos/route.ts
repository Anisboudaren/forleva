import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'

const SANDBOX_BYPASS_HEADER = 'x-vimeo-sandbox-test'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const sandboxBypassRequested = request.headers.get(SANDBOX_BYPASS_HEADER) === '1'
  const sandboxBypassEnabled = process.env.NODE_ENV !== 'production' && sandboxBypassRequested

  if (!sandboxBypassEnabled) {
    const session = await getUserSession()
    if (!session || session.role !== 'TEACHER') {
      return NextResponse.json(
        { ok: false, error: 'غير مصرح', code: 'AUTH_ROLE_NOT_TEACHER' },
        { status: 401 }
      )
    }
  }

  try {
    const token = process.env.VIMEO_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'VIMEO_ACCESS_TOKEN غير موجود', code: 'VIMEO_TOKEN_MISSING' },
        { status: 500 }
      )
    }

    const allItems: Array<{
      id: string
      title: string
      videoUrl: string
      embedUrl: string | null
      durationSec: number | null
      privacyEmbed: string | null
    }> = []

    let page = 1
    const perPage = 100
    const maxPages = 5

    while (page <= maxPages) {
      const url = new URL('https://api.vimeo.com/me/videos')
      url.searchParams.set('page', String(page))
      url.searchParams.set('per_page', String(perPage))
      url.searchParams.set(
        'fields',
        'uri,name,link,player_embed_url,duration,privacy.embed'
      )

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
        cache: 'no-store',
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        return NextResponse.json(
          {
            ok: false,
            error: 'فشل تحميل الفيديوهات من Vimeo',
            code: 'VIMEO_LIST_FAILED',
            providerStatus: res.status,
            providerBody: text || null,
          },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        )
      }

      const data = (await res.json()) as {
        data?: Array<{
          uri?: string
          name?: string
          link?: string
          player_embed_url?: string
          duration?: number
          privacy?: { embed?: string }
        }>
        paging?: { next?: string | null }
      }

      const batch = Array.isArray(data.data) ? data.data : []
      for (const item of batch) {
        const uri = item.uri ?? ''
        const id = uri.split('/').filter(Boolean).pop() ?? ''
        const link = typeof item.link === 'string' ? item.link.trim() : ''
        if (!id || !link) continue
        allItems.push({
          id,
          title: (item.name ?? '').trim() || `Vimeo ${id}`,
          videoUrl: link,
          embedUrl: item.player_embed_url ?? null,
          durationSec: typeof item.duration === 'number' ? item.duration : null,
          privacyEmbed: item.privacy?.embed ?? null,
        })
      }

      if (!data.paging?.next || batch.length < perPage) break
      page += 1
    }

    return NextResponse.json({
      ok: true,
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
      source: 'vimeo',
      items: allItems,
    })
  } catch (error) {
    console.error('GET /api/vimeo/test-videos error', error)
    return NextResponse.json(
      { ok: false, error: 'تعذر تحميل الفيديوهات الحالية', code: 'LIST_FAILED' },
      { status: 500 }
    )
  }
}

