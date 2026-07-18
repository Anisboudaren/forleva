import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'
import { logVimeoUploadError } from '@/lib/vimeo-errors'
import {
  VimeoApiError,
  fetchVimeoVideoStatus,
  getUploadLimits,
  isSandboxBypassEnabled,
  logAndReturnUploadFailure,
  mapVimeoErrorCode,
} from '@/lib/vimeo-upload-server'

export const runtime = 'nodejs'

type CompleteBody = {
  videoUri?: string
  courseId?: string | null
  requestId?: string
}

function isValidVideoUri(uri: string): boolean {
  return /^\/videos\/\d+(\/\w+)?$/.test(uri)
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
    const body = (await request.json().catch(() => null)) as CompleteBody | null
    if (!body || typeof body !== 'object') {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'طلب غير صالح',
        code: 'INVALID_BODY',
        limits,
        detail: 'Expected JSON body with videoUri',
      })
    }

    const videoUri = typeof body.videoUri === 'string' ? body.videoUri.trim() : ''
    const courseId =
      typeof body.courseId === 'string' && body.courseId.trim()
        ? body.courseId.trim()
        : null
    const clientRequestId =
      typeof body.requestId === 'string' && body.requestId.trim()
        ? body.requestId.trim()
        : null

    if (!videoUri || !isValidVideoUri(videoUri)) {
      return logAndReturnUploadFailure(requestId, 400, {
        error: 'معرّف فيديو غير صالح',
        code: 'INVALID_VIDEO_URI',
        limits,
        detail: `videoUri=${videoUri || '(empty)'}`,
      })
    }

    console.info(`[vimeo-upload:${requestId}] complete accepted`, {
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
      videoUri,
      courseId,
      clientRequestId,
    })

    const status = await fetchVimeoVideoStatus(token, videoUri)
    const uploadStatus = (status.uploadStatus ?? '').toLowerCase()

    // Vimeo may briefly report in_progress right after the last PATCH while
    // still accepting the file; reject only clear failure states.
    if (uploadStatus === 'error' || uploadStatus === 'failed') {
      return logAndReturnUploadFailure(requestId, 502, {
        error: 'فشل رفع الفيديو على Vimeo',
        code: 'VIMEO_UPLOAD_INCOMPLETE',
        limits,
        provider: 'vimeo',
        detail: `upload.status=${status.uploadStatus}`,
      })
    }

    let updatedCourseId: string | null = null
    if (courseId && !sandboxBypassEnabled) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          teacherId: actorId,
        },
        select: { id: true },
      })

      if (!course) {
        return logAndReturnUploadFailure(requestId, 404, {
          error: 'لم يتم العثور على الدورة',
          code: 'COURSE_NOT_FOUND',
          limits,
          detail: `courseId=${courseId} not found for teacher ${actorId}`,
        })
      }

      const updated = await prisma.course.update({
        where: { id: course.id },
        data: { videoUrl: status.videoUrl },
        select: { id: true },
      })
      updatedCourseId = updated.id
    }

    console.info(`[vimeo-upload:${requestId}] upload complete`, {
      vimeoId: status.vimeoId,
      videoUrl: status.videoUrl,
      uploadStatus: status.uploadStatus,
      transcodeStatus: status.transcodeStatus,
    })

    return NextResponse.json({
      ok: true,
      videoUrl: status.videoUrl,
      embedUrl: status.embedUrl,
      vimeoId: status.vimeoId,
      videoUri: status.videoUri,
      provider: 'vimeo',
      requestId,
      clientRequestId,
      limits,
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
      courseId: updatedCourseId,
      uploadStatus: status.uploadStatus,
      transcodeStatus: status.transcodeStatus,
    })
  } catch (err) {
    if (err instanceof VimeoApiError) {
      const code = mapVimeoErrorCode(err)
      const failure = {
        error: 'فشل التحقق من رفع Vimeo',
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
      error: 'فشل إتمام رفع الفيديو، حاول مرة أخرى',
      code: 'UPLOAD_COMPLETE_FAILED',
      limits,
      detail,
    })
  }
}
