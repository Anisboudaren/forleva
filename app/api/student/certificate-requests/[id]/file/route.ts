import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import { getR2Object } from '@/lib/cloudflare-s3'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitizeDownloadName(name: string): string {
  return name.replace(/[^\w.\-()\s\u0600-\u06FF]/g, '_').slice(0, 120) || 'certificate'
}

async function serveCertificateFile(
  requestId: string,
  disposition: 'inline' | 'attachment',
  actor: { type: 'student'; userId: string } | { type: 'admin' }
) {
  const cert = await prisma.certificateRequest.findUnique({
    where: { id: requestId },
    select: {
      userId: true,
      certificateFileKey: true,
      certificateFileName: true,
      certificateFileMime: true,
      status: true,
    },
  })

  if (!cert?.certificateFileKey) {
    return NextResponse.json({ error: 'الملف غير متوفر بعد' }, { status: 404 })
  }

  if (actor.type === 'student') {
    if (cert.userId !== actor.userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }
    if (cert.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'الشهادة غير جاهزة للتحميل بعد' }, { status: 403 })
    }
  }

  try {
    const object = await getR2Object(cert.certificateFileKey)
    const filename = sanitizeDownloadName(cert.certificateFileName ?? 'certificate')
    const contentDisposition =
      disposition === 'inline'
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"`

    return new NextResponse(object.body, {
      status: 200,
      headers: {
        'Content-Type': cert.certificateFileMime ?? object.contentType,
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('certificate file stream', err)
    return NextResponse.json({ error: 'تعذر تحميل الملف' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const disposition =
    request.nextUrl.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment'

  const adminSession = await getAdminSession()
  if (adminSession) {
    return serveCertificateFile(id, disposition, { type: 'admin' })
  }

  const userSession = await getUserSession()
  if (!userSession || userSession.role !== 'STUDENT') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  return serveCertificateFile(id, disposition, { type: 'student', userId: userSession.userId })
}
