import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'

// Ensure we run in the Node.js runtime (needed for Buffer, etc.)
export const runtime = 'nodejs'

const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024 // 500MB hard limit
const ALLOWED_MIME_PREFIX = 'video/'
const MAX_NAME_LENGTH = 120
const SANDBOX_BYPASS_HEADER = 'x-vimeo-sandbox-test'
const DEFAULT_MAX_DURATION_SECONDS = 60 * 60 * 4 // 4h fallback

// Very simple in-memory rate limiting per user (best-effort, not perfect across serverless instances).
// Limits each teacher to 5 uploads per rolling 10 minutes.
type UploadWindow = { timestamps: number[] }
const uploadWindows = new Map<string, UploadWindow>()
const UPLOAD_LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

type VimeoApiErrorData = {
  status: number
  error?: string
  developerMessage?: string
  invalidParameters?: unknown
  requestId?: string | null
  rawBody?: string
}

class VimeoApiError extends Error {
  status: number
  error?: string
  developerMessage?: string
  invalidParameters?: unknown
  requestId?: string | null
  rawBody?: string

  constructor(message: string, data: VimeoApiErrorData) {
    super(message)
    this.name = 'VimeoApiError'
    this.status = data.status
    this.error = data.error
    this.developerMessage = data.developerMessage
    this.invalidParameters = data.invalidParameters
    this.requestId = data.requestId
    this.rawBody = data.rawBody
  }
}

type UploadLimits = {
  maxSizeBytes: number
  acceptedMimePrefix: string
  maxNameLength: number
  maxDurationSec: number
}

function getUploadLimits(): UploadLimits {
  const envMaxDuration = Number(process.env.VIMEO_MAX_DURATION_SEC)
  return {
    maxSizeBytes: MAX_VIDEO_SIZE_BYTES,
    acceptedMimePrefix: ALLOWED_MIME_PREFIX,
    maxNameLength: MAX_NAME_LENGTH,
    maxDurationSec:
      Number.isFinite(envMaxDuration) && envMaxDuration > 0
        ? Math.floor(envMaxDuration)
        : DEFAULT_MAX_DURATION_SECONDS,
  }
}

function mapVimeoErrorCode(err: VimeoApiError): string {
  const combined = `${err.error ?? ''} ${err.developerMessage ?? ''}`.toLowerCase()
  if (err.status === 401 || combined.includes('invalid token') || combined.includes('access token')) {
    return 'VIMEO_TOKEN_INVALID'
  }
  if (combined.includes('scope') && combined.includes('upload')) {
    return 'VIMEO_SCOPE_MISSING_UPLOAD'
  }
  if (err.status === 403) {
    return 'VIMEO_FORBIDDEN_ACCOUNT'
  }
  return 'VIMEO_UPLOAD_PROVIDER_FAILED'
}

async function parseVimeoError(res: Response): Promise<VimeoApiError> {
  const requestId = res.headers.get('x-request-id') ?? res.headers.get('x-b3-traceid')
  const raw = await res.text().catch(() => '')
  let parsed: any = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }

  const error = parsed?.error ?? parsed?.message
  const developerMessage = parsed?.developer_message ?? parsed?.developerMessage
  const invalidParameters = parsed?.invalid_parameters ?? parsed?.invalidParameters

  return new VimeoApiError(
    `Vimeo request failed with status ${res.status}`,
    {
      status: res.status,
      error,
      developerMessage,
      invalidParameters,
      requestId,
      rawBody: raw || undefined,
    }
  )
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const window = uploadWindows.get(userId) ?? { timestamps: [] }
  // Remove old timestamps
  window.timestamps = window.timestamps.filter((t) => now - t < WINDOW_MS)
  if (window.timestamps.length >= UPLOAD_LIMIT) {
    uploadWindows.set(userId, window)
    return false
  }
  window.timestamps.push(now)
  uploadWindows.set(userId, window)
  return true
}

async function createVimeoUpload(
  token: string,
  fileSize: number,
  name: string
): Promise<{ uploadLink: string; videoUri: string; videoUrl: string; embedUrl: string | null }> {
  const res = await fetch('https://api.vimeo.com/me/videos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
    },
    body: JSON.stringify({
      upload: {
        approach: 'tus',
        size: fileSize,
      },
      name,
    }),
  })

  if (!res.ok) {
    throw await parseVimeoError(res)
  }

  const data = (await res.json()) as {
    upload?: { upload_link?: string }
    uri?: string
    link?: string
    player_embed_url?: string
  }

  const uploadLink = data.upload?.upload_link
  const videoUri = data.uri
  const videoUrl = data.link
  const embedUrl = data.player_embed_url ?? null

  if (!uploadLink || !videoUri || !videoUrl) {
    throw new Error('Vimeo response missing upload_link / uri / link')
  }

  return { uploadLink, videoUri, videoUrl, embedUrl }
}

async function uploadToVimeoTus(
  uploadLink: string,
  fileBuffer: Buffer,
  token: string
): Promise<void> {
  // For simplicity, we send the entire file in one PATCH request.
  // Vimeo TUS supports multiple PATCHes with offsets; a single PATCH works for most cases.
  const res = await fetch(uploadLink, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Tus-Resumable': '1.0.0',
      'Upload-Offset': '0',
      'Content-Type': 'application/offset+octet-stream',
      'Content-Length': String(fileBuffer.byteLength),
    },
    body: new Uint8Array(fileBuffer),
  })

  if (!res.ok) {
    throw await parseVimeoError(res)
  }
}

async function waitForTranscodeComplete(
  token: string,
  videoUri: string
): Promise<void> {
  const maxAttempts = 10
  const delayMs = 3000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`https://api.vimeo.com${videoUri}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw await parseVimeoError(res)
    }

    const data = (await res.json()) as {
      transcode?: { status?: string }
    }

    const status = data.transcode?.status
    if (status === 'complete') return
    if (status === 'error') {
      throw new Error('Vimeo transcode failed')
    }

    // Still in progress
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  // If still not complete after maxAttempts, we return anyway;
  // the video may become playable shortly after.
}

export async function POST(request: NextRequest) {
  const limits = getUploadLimits()
  const requestId = randomUUID()
  const sandboxBypassRequested = request.headers.get(SANDBOX_BYPASS_HEADER) === '1'
  const sandboxBypassEnabled = process.env.NODE_ENV !== 'production' && sandboxBypassRequested

  const session = sandboxBypassEnabled ? null : await getUserSession()
  if (!sandboxBypassEnabled && !session) {
    console.warn(`[vimeo-upload:${requestId}] Missing session`)
    return NextResponse.json(
      { ok: false, error: 'غير مصرح', code: 'AUTH_NO_SESSION', requestId, limits },
      { status: 401 }
    )
  }
  if (!sandboxBypassEnabled && session?.role !== 'TEACHER') {
    console.warn(`[vimeo-upload:${requestId}] Invalid role`, { role: session?.role })
    return NextResponse.json(
      { ok: false, error: 'غير مصرح', code: 'AUTH_ROLE_NOT_TEACHER', requestId, limits },
      { status: 403 }
    )
  }

  const actorId = session?.userId ?? 'sandbox-anonymous'
  if (!sandboxBypassEnabled && !checkRateLimit(actorId)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'عدد كبير من عمليات الرفع، حاول لاحقاً',
        code: 'RATE_LIMITED',
        requestId,
        limits,
      },
      { status: 429 }
    )
  }

  const token = process.env.VIMEO_ACCESS_TOKEN
  if (!token) {
    console.error(`[vimeo-upload:${requestId}] VIMEO_ACCESS_TOKEN is not configured`)
    return NextResponse.json(
      {
        ok: false,
        error: 'إعدادات الفيديو غير مفعّلة حالياً',
        code: 'VIMEO_TOKEN_MISSING',
        requestId,
        limits,
        provider: 'vimeo',
      },
      { status: 500 }
    )
  }

  try {
    console.info(`[vimeo-upload:${requestId}] request accepted`, {
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
    })
    const formData = await request.formData()
    const file = formData.get('file')
    const rawName = (formData.get('name') as string | null) ?? 'Course video'
    const name = rawName.trim().slice(0, MAX_NAME_LENGTH) || 'Course video'
    const courseId = formData.get('courseId') as string | null
    const rawDurationSec = formData.get('durationSec')
    const durationSec =
      typeof rawDurationSec === 'string' && rawDurationSec.trim()
        ? Number(rawDurationSec)
        : null

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'ملف الفيديو مطلوب',
          code: 'FILE_REQUIRED',
          requestId,
          limits,
        },
        { status: 400 }
      )
    }

    const size = file.size
    const mime = file.type || ''

    if (!mime.startsWith(ALLOWED_MIME_PREFIX)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'يجب أن يكون الملف فيديو صالحاً',
          code: 'INVALID_FILE_TYPE',
          requestId,
          limits,
        },
        { status: 400 }
      )
    }
    if (size <= 0 || size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: 'حجم الفيديو كبير جداً، الرجاء تقليصه',
          code: 'FILE_TOO_LARGE',
          maxSizeBytes: MAX_VIDEO_SIZE_BYTES,
          requestId,
          limits,
        },
        { status: 400 }
      )
    }
    if (durationSec !== null && (!Number.isFinite(durationSec) || durationSec <= 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'مدة الفيديو غير صالحة',
          code: 'INVALID_DURATION',
          requestId,
          limits,
        },
        { status: 400 }
      )
    }
    if (durationSec !== null && durationSec > limits.maxDurationSec) {
      return NextResponse.json(
        {
          ok: false,
          error: 'مدة الفيديو أطول من الحد المسموح',
          code: 'DURATION_TOO_LONG',
          requestId,
          limits,
        },
        { status: 400 }
      )
    }

    // Read file into memory buffer – for very large files you may want a streaming approach.
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1) Create Vimeo upload and get TUS upload_link + video URI + public link
    console.info(`[vimeo-upload:${requestId}] creating Vimeo upload`)
    const { uploadLink, videoUri, videoUrl, embedUrl } = await createVimeoUpload(
      token,
      buffer.byteLength,
      name
    )

    // 2) Upload file via TUS PATCH
    console.info(`[vimeo-upload:${requestId}] uploading via TUS`, { bytes: buffer.byteLength })
    await uploadToVimeoTus(uploadLink, buffer, token)

    // 3) Optionally wait for transcode completion
    console.info(`[vimeo-upload:${requestId}] polling transcode`, { videoUri })
    await waitForTranscodeComplete(token, videoUri).catch((err) => {
      // Log but don't fail the whole request; the video may still become playable.
      console.warn(`[vimeo-upload:${requestId}] Vimeo transcode polling error:`, err)
    })

    // 4) If a courseId is provided, update that course's main promo video URL immediately.
    let updatedCourseId: string | null = null
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          teacherId: actorId,
        },
        select: { id: true },
      })

      if (!course) {
        return NextResponse.json(
          {
            ok: false,
            error: 'لم يتم العثور على الدورة',
            code: 'COURSE_NOT_FOUND',
            requestId,
            limits,
          },
          { status: 404 }
        )
      }

      const updated = await prisma.course.update({
        where: { id: course.id },
        data: { videoUrl },
        select: { id: true },
      })
      updatedCourseId = updated.id
    }

    const vimeoId = videoUri.split('/').filter(Boolean).pop() ?? ''

    return NextResponse.json({
      ok: true,
      videoUrl,
      embedUrl,
      vimeoId,
      provider: 'vimeo',
      upload: {
        name,
        sizeBytes: size,
        mimeType: mime,
      },
      requestId,
      limits,
      mode: sandboxBypassEnabled ? 'sandbox-no-auth' : 'teacher-auth',
      courseId: updatedCourseId,
    })
  } catch (err) {
    if (err instanceof VimeoApiError) {
      const code = mapVimeoErrorCode(err)
      console.error(`[vimeo-upload:${requestId}] Vimeo provider error`, {
        status: err.status,
        code,
        providerError: err.error,
        providerDeveloperMessage: err.developerMessage,
        providerRequestId: err.requestId,
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'فشل الاتصال بخدمة Vimeo',
          code,
          requestId,
          limits,
          provider: 'vimeo',
          providerStatus: err.status,
          providerError: err.error ?? null,
          providerDeveloperMessage: err.developerMessage ?? null,
          providerRequestId: err.requestId ?? null,
          providerInvalidParameters: err.invalidParameters ?? null,
        },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 }
      )
    }
    console.error(`[vimeo-upload:${requestId}] POST /api/vimeo/upload error`, err)
    return NextResponse.json(
      {
        ok: false,
        error: 'فشل رفع الفيديو، حاول مرة أخرى',
        code: 'UPLOAD_FAILED',
        requestId,
        limits,
      },
      { status: 500 }
    )
  }
}

