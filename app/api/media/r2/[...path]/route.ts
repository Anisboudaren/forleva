import { NextRequest, NextResponse } from 'next/server'
import { getR2Object } from '@/lib/cloudflare-s3'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const key = path.join('/')

  if (!key) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const object = await getR2Object(key)
    return new NextResponse(object.body, {
      status: 200,
      headers: {
        'Content-Type': object.contentType,
        'Cache-Control': object.cacheControl ?? 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const code = (err as { name?: string; Code?: string }).name ?? (err as { Code?: string }).Code
    if (message.includes('not allowed') || code === 'NoSuchKey') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('[media/r2]', message)
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 })
  }
}
