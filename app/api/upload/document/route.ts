import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getAdminSession } from '@/lib/auth-session'
import { getUserSession } from '@/lib/user-session'
import { getCloudflareS3ConfigIssues } from '@/lib/cloudflare-s3-config'
import { isCloudflareS3Configured, uploadFileToR2 } from '@/lib/cloudflare-s3'
import { mapS3UploadError } from '@/lib/image-upload-errors'
import { MAX_PDF_SIZE_BYTES } from '@/lib/course-content'

export const runtime = 'nodejs'

const ALLOWED_MIME = 'application/pdf'

async function canUploadDocuments(): Promise<{ allowed: boolean }> {
  const userSession = await getUserSession()
  if (userSession?.role === 'TEACHER') return { allowed: true }

  const adminSession = await getAdminSession()
  if (adminSession) return { allowed: true }

  return { allowed: false }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()

  const { allowed } = await canUploadDocuments()
  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        requestId,
        error: 'يجب تسجيل الدخول كمعلّم لرفع الملفات',
        code: 'AUTH_REQUIRED',
      },
      { status: 401 }
    )
  }

  if (!isCloudflareS3Configured()) {
    const blockingIssues = getCloudflareS3ConfigIssues().filter(
      (issue) => issue.code !== 'PUBLIC_URL_RECOMMENDED'
    )
    return NextResponse.json(
      {
        ok: false,
        requestId,
        error: 'إعدادات التخزين غير مكتملة على السيرفر',
        code: 'STORAGE_NOT_CONFIGURED',
        issues: blockingIssues,
      },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const rawPrefix = (formData.get('prefix') as string | null)?.trim()
    const rawName = (formData.get('name') as string | null)?.trim()

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, requestId, error: 'لم يتم اختيار ملف', code: 'FILE_REQUIRED' },
        { status: 400 }
      )
    }

    const mime =
      file.type === ALLOWED_MIME || file.name.toLowerCase().endsWith('.pdf')
        ? ALLOWED_MIME
        : file.type

    if (mime !== ALLOWED_MIME) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: 'نوع الملف غير مدعوم',
          code: 'INVALID_FILE_TYPE',
          hint: 'يُقبل ملف PDF فقط',
        },
        { status: 400 }
      )
    }

    if (file.size <= 0 || file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: 'حجم الملف كبير جداً',
          code: 'FILE_TOO_LARGE',
          hint: `الحد الأقصى ${MAX_PDF_SIZE_BYTES / (1024 * 1024)} م.ب — استخدم «رابط خارجي» لملفات أكبر`,
        },
        { status: 400 }
      )
    }

    const prefix = rawPrefix?.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 60) || 'course-content'
    const buffer = Buffer.from(await file.arrayBuffer())

    const { key, url } = await uploadFileToR2(buffer, ALLOWED_MIME, {
      prefix,
      filename: rawName || file.name,
    })

    return NextResponse.json({
      ok: true,
      requestId,
      url,
      key,
      upload: { name: file.name, sizeBytes: file.size, mimeType: ALLOWED_MIME },
    })
  } catch (err) {
    const mapped = mapS3UploadError(err)
    console.error(`[document-upload:${requestId}]`, mapped.detail ?? err)
    return NextResponse.json(
      { ok: false, requestId, ...mapped },
      {
        status:
          mapped.httpStatus && mapped.httpStatus >= 400 && mapped.httpStatus < 600
            ? mapped.httpStatus
            : 500,
      }
    )
  }
}
