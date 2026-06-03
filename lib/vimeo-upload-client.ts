import {
  buildVimeoUploadErrorMessage,
  logVimeoUploadError,
  type VimeoUploadFailureDetails,
} from '@/lib/vimeo-errors'

export type VimeoUploadResult = {
  videoUrl: string
  embedUrl?: string | null
  vimeoId?: string
}

export type VimeoUploadOptions = {
  name?: string
  courseId?: string
  onProgress?: (pct: number) => void
}

export type VimeoUploadApiResponse = VimeoUploadFailureDetails & {
  ok?: boolean
  videoUrl?: string
  embedUrl?: string | null
  vimeoId?: string
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

export async function runVimeoUpload(
  file: File,
  options: VimeoUploadOptions = {}
): Promise<VimeoUploadResult> {
  const { name, courseId, onProgress } = options
  onProgress?.(5)

  const durationSec = await readVideoDurationSec(file)
  onProgress?.(15)

  const form = new FormData()
  form.append('file', file)
  form.append('name', (name?.trim() || file.name).slice(0, 120))
  if (durationSec !== null && durationSec > 0) {
    form.append('durationSec', String(Math.floor(durationSec)))
  }
  if (courseId) form.append('courseId', courseId)

  onProgress?.(25)

  let res: Response
  try {
    res = await fetch('/api/vimeo/upload', {
      method: 'POST',
      body: form,
    })
  } catch (networkErr) {
    const details: VimeoUploadFailureDetails = {
      code: 'NETWORK_ERROR',
      error: 'تعذر الاتصال بالسيرفر أثناء الرفع',
      detail: networkErr instanceof Error ? networkErr.message : String(networkErr),
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || undefined,
    }
    logVimeoUploadError('client', details)
    throw new VimeoUploadError(buildVimeoUploadErrorMessage(details), details)
  }

  onProgress?.(90)

  const contentType = res.headers.get('content-type') ?? ''
  let data: VimeoUploadApiResponse = {}

  if (contentType.includes('application/json')) {
    data = (await res.json().catch(() => ({}))) as VimeoUploadApiResponse
  } else {
    const raw = await res.text().catch(() => '')
    const details: VimeoUploadFailureDetails = {
      code: 'NON_JSON_RESPONSE',
      error: 'استجابة غير متوقعة من السيرفر (قد يكون حد nginx أو انتهاء المهلة)',
      httpStatus: res.status,
      detail: raw ? raw.slice(0, 500) : res.statusText,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || undefined,
    }
    logVimeoUploadError('client', details)
    throw new VimeoUploadError(buildVimeoUploadErrorMessage(details), details)
  }

  if (!res.ok || data.ok === false) {
    const details = failureFromApi(data, res.status, file)
    logVimeoUploadError('client', details)
    throw new VimeoUploadError(buildVimeoUploadErrorMessage(details), details)
  }

  const videoUrl = data.videoUrl?.trim()
  if (!videoUrl) {
    const details: VimeoUploadFailureDetails = {
      code: 'MISSING_VIDEO_URL',
      error: 'فشل رفع الفيديو: لم يُرجع رابط Vimeo',
      requestId: data.requestId,
      httpStatus: res.status,
      fileName: file.name,
      fileSizeBytes: file.size,
    }
    logVimeoUploadError('client', details)
    throw new VimeoUploadError(buildVimeoUploadErrorMessage(details), details)
  }

  onProgress?.(100)
  return {
    videoUrl,
    embedUrl: data.embedUrl ?? null,
    vimeoId: data.vimeoId,
  }
}
