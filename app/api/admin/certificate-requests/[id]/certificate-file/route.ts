import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import {
  ALLOWED_CERTIFICATE_UPLOAD_MIMES,
  isCloudflareS3Configured,
  uploadFileToR2,
} from '@/lib/cloudflare-s3'
import { mapS3UploadError } from '@/lib/image-upload-errors'
import {
  buildCertificateR2Key,
  certificateMimeToExt,
} from '@/lib/certificate-file'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
}

function resolveFileMime(file: File): string {
  const declared = file.type?.trim()
  if (declared && ALLOWED_CERTIFICATE_UPLOAD_MIMES.includes(declared)) return declared

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext]

  return declared || ''
}

/**
 * POST /api/admin/certificate-requests/[id]/certificate-file
 * Upload certificate image or PDF to R2 (students-certificates/).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!isCloudflareS3Configured()) {
    return NextResponse.json(
      { error: 'إعدادات التخزين غير مفعّلة', code: 'STORAGE_NOT_CONFIGURED' },
      { status: 500 }
    )
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 })
  }

  const existing = await prisma.certificateRequest.findUnique({
    where: { id },
    select: { id: true, status: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }
  if (existing.status === 'CANCELLED') {
    return NextResponse.json({ error: 'لا يمكن رفع ملف لطلب ملغى' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const markCompleted = formData.get('markCompleted') !== 'false'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    const mime = resolveFileMime(file)
    if (!ALLOWED_CERTIFICATE_UPLOAD_MIMES.includes(mime)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم (صورة أو PDF فقط)', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      )
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً (الحد الأقصى 15 م.ب)', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      )
    }

    const ext = certificateMimeToExt(mime)
    const key = buildCertificateR2Key(id, ext)
    const buffer = Buffer.from(await file.arrayBuffer())

    const { url } = await uploadFileToR2(buffer, mime, { prefix: 'students-certificates', key })

    const updated = await prisma.certificateRequest.update({
      where: { id },
      data: {
        certificateFileUrl: url,
        certificateFileKey: key,
        certificateFileName: file.name,
        certificateFileMime: mime,
        certificateUploadedAt: new Date(),
        ...(markCompleted && existing.status !== 'COMPLETED' ? { status: 'COMPLETED' } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, whatsapp: true } },
        course: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json({ ok: true, request: updated })
  } catch (err) {
    const mapped = mapS3UploadError(err)
    console.error('POST certificate-file', mapped.detail ?? err)
    return NextResponse.json(
      { ok: false, error: mapped.error ?? 'فشل رفع الملف', ...mapped },
      { status: 500 }
    )
  }
}
