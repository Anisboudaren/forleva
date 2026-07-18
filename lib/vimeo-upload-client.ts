import {
  buildVimeoUploadErrorMessage,
  logVimeoUploadError,
  type VimeoUploadFailureDetails,
} from '@/lib/vimeo-errors'

/** 16MB chunks — good browser memory tradeoff; Vimeo accepts any size. */
const TUS_CHUNK_SIZE = 16 * 1024 * 1024
const VIMEO_ACCEPT = 'application/vnd.vimeo.*+json;version=3.4'
const SANDBOX_BYPASS_HEADER = 'x-vimeo-sandbox-test'

export type VimeoUploadResult = {
  videoUrl: string
  embedUrl?: string | null
  vimeoId?: string
}

export type VimeoUploadOptions = {
  name?: string
  courseId?: string
  onProgress?: (pct: number) => void
  /** Dev-only: sends sandbox bypass header to create/complete APIs. */
  sandbox?: boolean
}

export type VimeoUploadApiResponse = VimeoUploadFailureDetails & {
  ok?: boolean
  uploadLink?: string
  videoUri?: string
  videoUrl?: string
  embedUrl?: string | null
  vimeoId?: string
  requestId?: string
}

export class VimeoUploadError extends Error {
  details: VimeoUploadFailureDetails

  constructor(message: string, details: VimeoUploadFailureDetails) {
    super(message)
    this.name = 'VimeoUploadError'
    this.details = details
  }
}

export function readVideoDurationSec(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const objectUrl = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl)
      const duration = video.duration
      resolve(Number.isFinite(duration) && duration > 0 ? duration : null)
    }
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }
    video.src = objectUrl
  })
}

function failureFromApi(
  data: VimeoUploadApiResponse,
  httpStatus: number,
  file: File
): VimeoUploadFailureDetails {
  return {
    code: data.code,
    error: data.error,
    requestId: data.requestId,
    httpStatus,
    provider: data.provider,
    providerStatus: data.providerStatus,
    providerError: data.providerError,
    providerDeveloperMessage: data.providerDeveloperMessage,
    providerRequestId: data.providerRequestId,
    providerInvalidParameters: data.providerInvalidParameters,
    detail: data.detail,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || undefined,
  }
}

function throwFromDetails(details: VimeoUploadFailureDetails): never {
  logVimeoUploadError('client', details)
  throw new VimeoUploadError(buildVimeoUploadErrorMessage(details), details)
}

async function parseJsonResponse(
  res: Response,
  file: File
): Promise<VimeoUploadApiResponse> {
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await res.json().catch(() => ({}))) as VimeoUploadApiResponse
  }

  const raw = await res.text().catch(() => '')
  const isNginx413 =
    res.status === 413 ||
    raw.includes('413 Request Entity Too Large') ||
    raw.toLowerCase().includes('nginx')
  throwFromDetails({
    code: isNginx413 ? 'NGINX_BODY_TOO_LARGE' : 'NON_JSON_RESPONSE',
    error: isNginx413
      ? `الملف ${(file.size / (1024 * 1024)).toFixed(1)} م.ب — nginx يرفض الطلب (413). زِد client_max_body_size`
      : 'استجابة غير متوقعة من السيرفر',
    httpStatus: res.status,
    detail: isNginx413
      ? `nginx 413 — file ${file.size} bytes; set client_max_body_size 500M`
      : raw
        ? raw.slice(0, 300)
        : res.statusText,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || undefined,
  })
}

function apiHeaders(sandbox?: boolean): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (sandbox) headers[SANDBOX_BYPASS_HEADER] = '1'
  return headers
}

async function createUploadTicket(
  file: File,
  options: VimeoUploadOptions,
  durationSec: number | null
): Promise<{
  uploadLink: string
  videoUri: string
  videoUrl: string
  embedUrl: string | null
  vimeoId?: string
  requestId?: string
}> {
  let res: Response
  try {
    res = await fetch('/api/vimeo/upload', {
      method: 'POST',
      headers: apiHeaders(options.sandbox),
      body: JSON.stringify({
        name: (options.name?.trim() || file.name).slice(0, 120),
        sizeBytes: file.size,
        mimeType: file.type || 'video/mp4',
        durationSec:
          durationSec !== null && durationSec > 0 ? Math.floor(durationSec) : null,
        courseId: options.courseId ?? null,
      }),
    })
  } catch (networkErr) {
    throwFromDetails({
      code: 'NETWORK_ERROR',
      error: 'تعذر الاتصال بالسيرفر أثناء إنشاء الرفع',
      detail: networkErr instanceof Error ? networkErr.message : String(networkErr),
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || undefined,
    })
  }

  const data = await parseJsonResponse(res, file)
  if (!res.ok || data.ok === false) {
    throwFromDetails(failureFromApi(data, res.status, file))
  }

  const uploadLink = data.uploadLink?.trim()
  const videoUri = data.videoUri?.trim()
  const videoUrl = data.videoUrl?.trim()
  if (!uploadLink || !videoUri || !videoUrl) {
    throwFromDetails({
      code: 'MISSING_UPLOAD_TICKET',
      error: 'فشل إنشاء رابط الرفع من Vimeo',
      requestId: data.requestId,
      httpStatus: res.status,
      fileName: file.name,
      fileSizeBytes: file.size,
    })
  }

  return {
    uploadLink,
    videoUri,
    videoUrl,
    embedUrl: data.embedUrl ?? null,
    vimeoId: data.vimeoId,
    requestId: data.requestId,
  }
}

async function readUploadOffset(uploadLink: string): Promise<number> {
  try {
    const res = await fetch(uploadLink, {
      method: 'HEAD',
      headers: {
        'Tus-Resumable': '1.0.0',
        Accept: VIMEO_ACCEPT,
      },
    })
    if (!res.ok) return 0
    const offset = Number(res.headers.get('Upload-Offset') ?? '0')
    return Number.isFinite(offset) && offset > 0 ? offset : 0
  } catch {
    return 0
  }
}

async function uploadFileViaTus(
  uploadLink: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  let offset = await readUploadOffset(uploadLink)
  if (offset > 0) {
    onProgress?.(Math.min(89, Math.round(10 + (offset / file.size) * 80)))
  }

  while (offset < file.size) {
    const end = Math.min(offset + TUS_CHUNK_SIZE, file.size)
    const chunk = file.slice(offset, end)

    let res: Response
    try {
      res = await fetch(uploadLink, {
        method: 'PATCH',
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Offset': String(offset),
          'Content-Type': 'application/offset+octet-stream',
          Accept: VIMEO_ACCEPT,
        },
        body: chunk,
      })
    } catch (networkErr) {
      throwFromDetails({
        code: 'TUS_NETWORK_ERROR',
        error: 'انقطع الاتصال أثناء رفع الفيديو إلى Vimeo',
        detail: networkErr instanceof Error ? networkErr.message : String(networkErr),
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || undefined,
      })
    }

    if (!res.ok) {
      const raw = await res.text().catch(() => '')
      throwFromDetails({
        code: 'TUS_UPLOAD_FAILED',
        error: 'فشل رفع جزء من الفيديو إلى Vimeo',
        httpStatus: res.status,
        provider: 'vimeo',
        providerStatus: res.status,
        detail: raw ? raw.slice(0, 300) : res.statusText,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || undefined,
      })
    }

    const nextOffsetHeader = res.headers.get('Upload-Offset')
    const nextOffset = nextOffsetHeader
      ? Number(nextOffsetHeader)
      : offset + chunk.size

    if (!Number.isFinite(nextOffset) || nextOffset <= offset) {
      throwFromDetails({
        code: 'TUS_OFFSET_STALLED',
        error: 'توقف تقدم الرفع إلى Vimeo',
        detail: `offset=${offset}; next=${String(nextOffsetHeader)}`,
        fileName: file.name,
        fileSizeBytes: file.size,
      })
    }

    offset = nextOffset
    // Map bytes to 10–90% of overall progress.
    onProgress?.(Math.min(90, Math.round(10 + (offset / file.size) * 80)))
  }
}

async function completeUpload(
  file: File,
  options: VimeoUploadOptions,
  ticket: { videoUri: string; requestId?: string }
): Promise<VimeoUploadResult> {
  let res: Response
  try {
    res = await fetch('/api/vimeo/upload/complete', {
      method: 'POST',
      headers: apiHeaders(options.sandbox),
      body: JSON.stringify({
        videoUri: ticket.videoUri,
        courseId: options.courseId ?? null,
        requestId: ticket.requestId ?? null,
      }),
    })
  } catch (networkErr) {
    throwFromDetails({
      code: 'NETWORK_ERROR',
      error: 'تعذر الاتصال بالسيرفر أثناء إتمام الرفع',
      detail: networkErr instanceof Error ? networkErr.message : String(networkErr),
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || undefined,
    })
  }

  const data = await parseJsonResponse(res, file)
  if (!res.ok || data.ok === false) {
    throwFromDetails(failureFromApi(data, res.status, file))
  }

  const videoUrl = data.videoUrl?.trim()
  if (!videoUrl) {
    throwFromDetails({
      code: 'MISSING_VIDEO_URL',
      error: 'فشل رفع الفيديو: لم يُرجع رابط Vimeo',
      requestId: data.requestId,
      httpStatus: res.status,
      fileName: file.name,
      fileSizeBytes: file.size,
    })
  }

  return {
    videoUrl,
    embedUrl: data.embedUrl ?? null,
    vimeoId: data.vimeoId,
  }
}

/**
 * Official Vimeo flow: server creates a TUS ticket, browser uploads
 * chunks directly to Vimeo, then server verifies and saves the URL.
 */
export async function runVimeoUpload(
  file: File,
  options: VimeoUploadOptions = {}
): Promise<VimeoUploadResult> {
  const { onProgress } = options
  onProgress?.(2)

  const durationSec = await readVideoDurationSec(file)
  onProgress?.(5)

  const ticket = await createUploadTicket(file, options, durationSec)
  onProgress?.(10)

  await uploadFileViaTus(ticket.uploadLink, file, onProgress)
  onProgress?.(92)

  const result = await completeUpload(file, options, ticket)
  onProgress?.(100)
  return result
}
