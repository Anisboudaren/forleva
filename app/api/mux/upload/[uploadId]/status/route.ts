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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { uploadId } = await params
  if (!uploadId) {
    return NextResponse.json({ error: 'معرف الرفع مطلوب' }, { status: 400 })
  }

  try {
    const auth = getMuxAuth()

    const uploadRes = await fetch(`${MUX_API_BASE}/uploads/${uploadId}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: 'no-store',
    })
    if (!uploadRes.ok) {
      if (uploadRes.status === 404) {
        return NextResponse.json({ error: 'الرفع غير موجود' }, { status: 404 })
      }
      const text = await uploadRes.text().catch(() => '')
      console.error('Mux get upload error', uploadRes.status, text)
      return NextResponse.json(
        { error: 'فشل التحقق من حالة الرفع' },
        { status: 502 }
      )
    }

    const uploadData = (await uploadRes.json()) as {
      data?: { status?: string; asset_id?: string }
    }
    const status = uploadData.data?.status
    const assetId = uploadData.data?.asset_id

    if (status === 'errored') {
      return NextResponse.json({
        status: 'errored',
        playbackId: undefined,
        playbackUrl: undefined,
      })
    }

    if (status !== 'asset_created' && status !== 'ready') {
      return NextResponse.json({
        status: status ?? 'waiting',
        playbackId: undefined,
        playbackUrl: undefined,
      })
    }

    if (!assetId) {
      return NextResponse.json({
        status: status ?? 'waiting',
        playbackId: undefined,
        playbackUrl: undefined,
      })
    }

    const assetRes = await fetch(`${MUX_API_BASE}/assets/${assetId}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: 'no-store',
    })
    if (!assetRes.ok) {
      const text = await assetRes.text().catch(() => '')
      console.error('Mux get asset error', assetRes.status, text)
      return NextResponse.json({
        status: 'asset_created',
        playbackId: undefined,
        playbackUrl: undefined,
      })
    }

    const assetJson = (await assetRes.json()) as {
      data?: { playback_ids?: Array<{ id?: string }> }
    }
    const playbackIds = assetJson.data?.playback_ids
    const playbackId = playbackIds?.[0]?.id

    if (!playbackId) {
      return NextResponse.json({
        status: 'processing',
        playbackId: undefined,
        playbackUrl: undefined,
      })
    }

    const playbackUrl = `https://stream.mux.com/${playbackId}.m3u8`
    return NextResponse.json({
      status: 'ready',
      playbackId,
      playbackUrl,
    })
  } catch (err) {
    console.error('GET /api/mux/upload/[uploadId]/status', err)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
