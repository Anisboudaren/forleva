import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'

const MUX_API_BASE = 'https://api.mux.com/video/v1'

function getMuxAuth(): string {
  const tokenId = process.env.MUX_TOKEN_ID
  const secret = process.env.MUX_TOKEN_SECRET ?? process.env.MUX_SECRET_KEY
  if (!tokenId || !secret) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET (or MUX_SECRET_KEY) must be set')
  }
  return Buffer.from(`${tokenId}:${secret}`).toString('base64')
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const auth = getMuxAuth()
    const res = await fetch(`${MUX_API_BASE}/uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        cors_origin: '*',
        new_asset_settings: {
          playback_policies: ['public'],
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Mux create upload error', res.status, text)
      return NextResponse.json(
        { error: 'فشل إنشاء رفع Mux' },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      data?: { id?: string; url?: string; asset_id?: string }
    }
    const id = data.data?.id
    const url = data.data?.url
    const assetId = data.data?.asset_id

    if (!id || !url) {
      return NextResponse.json(
        { error: 'استجابة Mux غير مكتملة' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      uploadId: id,
      url,
      assetId: assetId ?? undefined,
    })
  } catch (err) {
    console.error('POST /api/mux/direct-upload', err)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
