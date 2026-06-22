import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getAdminSession } from '@/lib/auth-session'
import { getUserSession } from '@/lib/user-session'
import { getCloudflareS3ConfigIssues } from '@/lib/cloudflare-s3-config'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  isCloudflareS3Configured,
  uploadImageToCloudflare,
} from '@/lib/cloudflare-s3'
import { mapS3UploadError } from '@/lib/image-upload-errors'

export const runtime = 'nodejs'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

function resolveImageMime(file: File): string {
  const declared = file.type?.trim()
  if (declared && ALLOWED_IMAGE_MIME_TYPES.includes(declared)) return declared

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext]

  return declared || ''
}

async function canUploadImages(): Promise<{ allowed: boolean; actorId: string | null }> {
  const userSession = await getUserSession()
  if (userSession?.role === 'TEACHER') {
    return { allowed: true, actorId: userSession.userId }
  }

  const adminSession = await getAdminSession()
  if (adminSession) {
    return { allowed: true, actorId: adminSession.userId }
  }

  return { allowed: false, actorId: null }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()

  const { allowed } = await canUploadImages()
  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        requestId,
        error: 'يجب تسجيل الدخول كمعلّم لرفع الصور',
        code: 'AUTH_REQUIRED',
        hint: 'سجّل الدخول من حساب المعلّم ثم أعد المحاولة',
      },
      { status: 401 }
    )
  }

  const configIssues = getCloudflareS3ConfigIssues()
  const endpointWarning = configIssues.find((issue) => issue.code === 'WRONG_ENDPOINT')

  if (!isCloudflareS3Configured()) {
    const blockingIssues = configIssues.filter(
      (issue) => issue.code !== 'PUBLIC_URL_RECOMMENDED'
    )
    console.error(`[image-upload:${requestId}] storage not configured`, blockingIssues)
    return NextResponse.json(
      {
        ok: false,
        requestId,
        error: 'إعدادات تخزين الصور غير مكتملة على السيرفر',
        code: 'STORAGE_NOT_CONFIGURED',
        hint: 'أضف متغيرات CLOUDFLARE_S3_* في .env واحفظ الملف ثم أعد تشغيل npm run dev',
        issues: blockingIssues,
      },
      { status: 500 }
    )
  }

  if (endpointWarning) {
    console.warn(`[image-upload:${requestId}] suspicious endpoint`, endpointWarning)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const rawPrefix = (formData.get('prefix') as string | null)?.trim()
    const rawName = (formData.get('name') as string | null)?.trim()

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: 'لم يتم اختيار ملف صورة',
          code: 'FILE_REQUIRED',
          hint: 'اختر صورة بصيغة JPEG أو PNG أو WebP',
        },
        { status: 400 }
      )
    }

    const mime = resolveImageMime(file)
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: 'نوع الصورة غير مدعوم',
          code: 'INVALID_FILE_TYPE',
          hint: 'الصيغ المدعومة: JPEG, PNG, WebP, GIF, SVG',
          detail: `mime=${file.type || '(فارغ)'} name=${file.name}`,
        },
        { status: 400 }
      )
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: 'حجم الصورة كبير جداً',
          code: 'FILE_TOO_LARGE',
          hint: `الحد الأقصى ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} م.ب — حجم الملف ${(file.size / (1024 * 1024)).toFixed(1)} م.ب`,
        },
        { status: 400 }
      )
    }

    const prefix = rawPrefix?.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 60) || 'images'
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { key, url } = await uploadImageToCloudflare(buffer, mime, {
      prefix,
      filename: rawName || file.name,
    })

    return NextResponse.json({
      ok: true,
      requestId,
      url,
      key,
      upload: {
        name: file.name,
        sizeBytes: file.size,
        mimeType: mime,
      },
    })
  } catch (err) {
    const mapped = mapS3UploadError(err)
    console.error(`[image-upload:${requestId}]`, mapped.detail ?? err)
    return NextResponse.json(
      {
        ok: false,
        requestId,
        ...mapped,
      },
      { status: mapped.httpStatus && mapped.httpStatus >= 400 && mapped.httpStatus < 600 ? mapped.httpStatus : 500 }
    )
  }
}
