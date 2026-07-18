import { NextResponse } from 'next/server'
import {
  logVimeoUploadError,
  type VimeoUploadFailureDetails,
} from '@/lib/vimeo-errors'

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024 // 500MB
export const ALLOWED_MIME_PREFIX = 'video/'
export const MAX_NAME_LENGTH = 120
export const SANDBOX_BYPASS_HEADER = 'x-vimeo-sandbox-test'
export const DEFAULT_MAX_DURATION_SECONDS = 60 * 60 * 4 // 4h

type UploadWindow = { timestamps: number[] }
const uploadWindows = new Map<string, UploadWindow>()
const UPLOAD_LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

export type UploadLimits = {
  maxSizeBytes: number
  acceptedMimePrefix: string
  maxNameLength: number
  maxDurationSec: number
}

export type VimeoApiErrorData = {
  status: number
  error?: string
  developerMessage?: string
  invalidParameters?: unknown
  requestId?: string | null
  rawBody?: string
}

export class VimeoApiError extends Error {
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

export function getUploadLimits(): UploadLimits {
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

export function mapVimeoErrorCode(err: VimeoApiError): string {
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

export async function parseVimeoError(res: Response): Promise<VimeoApiError> {
  const requestId = res.headers.get('x-request-id') ?? res.headers.get('x-b3-traceid')
  const raw = await res.text().catch(() => '')
  let parsed: Record<string, unknown> | null = null
  try {
    parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : null
  } catch {
    parsed = null
  }

  const error =
    typeof parsed?.error === 'string'
      ? parsed.error
      : typeof parsed?.message === 'string'
        ? parsed.message
        : undefined
  const developerMessage =
    typeof parsed?.developer_message === 'string'
      ? parsed.developer_message
      : typeof parsed?.developerMessage === 'string'
        ? parsed.developerMessage
        : undefined
  const invalidParameters = parsed?.invalid_parameters ?? parsed?.invalidParameters

  return new VimeoApiError(`Vimeo request failed with status ${res.status}`, {
    status: res.status,
    error,
    developerMessage,
    invalidParameters,
    requestId,
    rawBody: raw || undefined,
  })
}

export function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const window = uploadWindows.get(userId) ?? { timestamps: [] }
  window.timestamps = window.timestamps.filter((t) => now - t < WINDOW_MS)
  if (window.timestamps.length >= UPLOAD_LIMIT) {
    uploadWindows.set(userId, window)
    return false
  }
  window.timestamps.push(now)
  uploadWindows.set(userId, window)
  return true
}

export function logAndReturnUploadFailure(
  requestId: string,
  status: number,
  body: VimeoUploadFailureDetails & Record<string, unknown>
) {
  logVimeoUploadError('server', { requestId, httpStatus: status, ...body })
  return NextResponse.json({ ok: false, requestId, ...body }, { status })
}

export function vimeoAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.vimeo.*+json;version=3.4',
  }
}

export async function createVimeoUpload(
  token: string,
  fileSize: number,
  name: string
): Promise<{ uploadLink: string; videoUri: string; videoUrl: string; embedUrl: string | null }> {
  const res = await fetch('https://api.vimeo.com/me/videos', {
    method: 'POST',
    headers: {
      ...vimeoAuthHeaders(token),
      'Content-Type': 'application/json',
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

export type VimeoVideoStatus = {
  videoUri: string
  videoUrl: string
  embedUrl: string | null
  vimeoId: string
  uploadStatus: string | null
  transcodeStatus: string | null
}

export async function fetchVimeoVideoStatus(
  token: string,
  videoUri: string
): Promise<VimeoVideoStatus> {
  const res = await fetch(`https://api.vimeo.com${videoUri}`, {
    headers: vimeoAuthHeaders(token),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await parseVimeoError(res)
  }

  const data = (await res.json()) as {
    uri?: string
    link?: string
    player_embed_url?: string
    upload?: { status?: string }
    transcode?: { status?: string }
  }

  const uri = data.uri ?? videoUri
  const videoUrl = data.link
  if (!videoUrl) {
    throw new Error('Vimeo video response missing link')
  }

  return {
    videoUri: uri,
    videoUrl,
    embedUrl: data.player_embed_url ?? null,
    vimeoId: uri.split('/').filter(Boolean).pop() ?? '',
    uploadStatus: data.upload?.status ?? null,
    transcodeStatus: data.transcode?.status ?? null,
  }
}

export function isSandboxBypassEnabled(request: Request): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    request.headers.get(SANDBOX_BYPASS_HEADER) === '1'
  )
}
