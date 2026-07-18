import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getUserSession } from '@/lib/user-session'
import { logVimeoUploadError } from '@/lib/vimeo-errors'
import {
  ALLOWED_MIME_PREFIX,
  MAX_NAME_LENGTH,
  MAX_VIDEO_SIZE_BYTES,
  VimeoApiError,
  checkRateLimit,
  createVimeoUpload,
  getUploadLimits,
  isSandboxBypassEnabled,
  logAndReturnUploadFailure,
  mapVimeoErrorCode,
} from '@/lib/vimeo-upload-server'

export const runtime = 'nodejs'

type CreateBody = {
  name?: string
  sizeBytes?: number
  mimeType?: string
  durationSec?: number | null
  courseId?: string | null
}

export async function POST(request: NextRequest) {
  const limits = getUploadLimits()
  const requestId = randomUUID()
  const sandboxBypassEnabled = isSandboxBypassEnabled(request)

  const session = sandboxBypassEnabled ? null : await getUserSession()
  if (!sandboxBypassEnabled && !session) {
    return logAndReturnUploadFailure(requestId, 401, {
      error: 'غير مصرح',
      code: 'AUTH_NO_SESSION',
      limits,
      detail: 'No forleva_user_session cookie or invalid session',
    })
  }
  if (!sandboxBypassEnabled && session?.role !== 'TEACHER') {
    return logAndReturnUploadFailure(requestId, 403, {
      error: 'غير مصرح',
      code: 'AUTH_ROLE_NOT_TEACHER',
      limits,
      detail: `Session role is ${session?.role ?? 'unknown'}, expected TEACHER`,
    })
  }

  const actorId = session?.userId ?? 'sandbox-anonymous'
  if (!sandboxBypassEnabled && !checkRateLimit(actorId)) {
    return logAndReturnUploadFailure(requestId, 429, {
      error: 'عدد كبير من عمليات الرفع، حاول لاحقاً',
      code: 'RATE_LIMITED',
      limits,
      detail: `Teacher ${actorId} exceeded upload rate limit`,
    })
  }

  const token = process.env.VIMEO_ACCESS_TOKEN
  if (!token) {
    return logAndReturnUploadFailure(requestId, 500, {
      error: 'إعدادات الفيديو غير مفعّلة حالياً',
      code: 'VIMEO_TOKEN_MISSING',
      limits,
      provider: 'vimeo',
      detail: 'VIMEO_ACCESS_TOKEN is not set in server environment',
    })
  }

  try {
    const body = (await request.json().catch(() => null)) as CreateBody | null
    if (!body || typeof body !== 'object') {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'طلب غير صالح',
        code: 'INVALID_BODY',
        limits,
        detail: 'Expected JSON body with sizeBytes and mimeType',
      })
    }

    const rawName = typeof body.name === 'string' ? body.name : 'Course video'
    const name = rawName.trim().slice(0, MAX_NAME_LENGTH) || 'Course video'
    const size = Number(body.sizeBytes)
    const mime = typeof body.mimeType === 'string' ? body.mimeType : ''
    const durationSec =
      body.durationSec === null || body.durationSec === undefined
        ? null
        : Number(body.durationSec)
    const courseId =
      typeof body.courseId === 'string' && body.courseId.trim()
        ? body.courseId.trim()
        : null

    console.info(`[vimeo-upload:${requestId}] create accepted`, {
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
      sizeBytes: size,
      mimeType: mime || '(empty)',
      durationSec,
      courseId,
    })

    if (!mime.startsWith(ALLOWED_MIME_PREFIX)) {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'يجب أن يكون الملف فيديو صالحاً',
        code: 'INVALID_FILE_TYPE',
        limits,
        mimeType: mime,
        fileSizeBytes: Number.isFinite(size) ? size : undefined,
        detail: `Expected mime starting with ${ALLOWED_MIME_PREFIX}`,
      })
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_VIDEO_SIZE_BYTES) {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'حجم الفيديو كبير جداً، الرجاء تقليصه',
        code: 'FILE_TOO_LARGE',
        limits,
        fileSizeBytes: Number.isFinite(size) ? size : undefined,
        mimeType: mime,
        detail: `Size ${size} bytes; max ${MAX_VIDEO_SIZE_BYTES}`,
      })
    }
    if (durationSec !== null && (!Number.isFinite(durationSec) || durationSec <= 0)) {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'مدة الفيديو غير صالحة',
        code: 'INVALID_DURATION',
        limits,
        detail: `durationSec=${String(body.durationSec)}`,
      })
    }
    if (durationSec !== null && durationSec > limits.maxDurationSec) {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'مدة الفيديو أطول من الحد المسموح',
        code: 'DURATION_TOO_LONG',
        limits,
        detail: `durationSec=${durationSec}; max ${limits.maxDurationSec}`,
      })
    }

    console.info(`[vimeo-upload:${requestId}] creating Vimeo upload`)
    const { uploadLink, videoUri, videoUrl, embedUrl } = await createVimeoUpload(
      token,
      size,
      name
    )
    const vimeoId = videoUri.split('/').filter(Boolean).pop() ?? ''

    console.info(`[vimeo-upload:${requestId}] upload ticket ready`, {
      vimeoId,
      videoUri,
      sizeBytes: size,
    })

    return NextResponse.json({
      ok: true,
      uploadLink,
      videoUri,
      videoUrl,
      embedUrl,
      vimeoId,
      provider: 'vimeo',
      requestId,
      limits,
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
      courseId,
      upload: {
        name,
        sizeBytes: size,
        mimeType: mime,
      },
    })
  } catch (err) {
    if (err instanceof VimeoApiError) {
      const code = mapVimeoErrorCode(err)
      const failure = {
        error: 'فشل الاتصال بخدمة Vimeo',
        code,
        provider: 'vimeo',
        providerStatus: err.status,
        providerError: err.error ?? null,
        providerDeveloperMessage: err.developerMessage ?? null,
        providerRequestId: err.requestId ?? null,
        providerInvalidParameters: err.invalidParameters ?? null,
        detail: err.rawBody ? err.rawBody.slice(0, 500) : undefined,
      }
      logVimeoUploadError('server', { requestId, httpStatus: err.status, ...failure })
      return NextResponse.json(
        { ok: false, requestId, limits, ...failure },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 }
      )
    }

    const detail = err instanceof Error ? err.message : String(err)
    if (err instanceof Error && err.stack) {
      console.error(`[vimeo-upload:${requestId}] stack`, err.stack)
    }
    return logAndReturnUploadFailure(requestId, 500, {
      error: 'فشل إنشاء رفع الفيديو، حاول مرة أخرى',
      code: 'UPLOAD_CREATE_FAILED',
      limits,
      detail,
    })
  }
}
