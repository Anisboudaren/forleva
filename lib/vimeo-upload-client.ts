import { getVimeoUploadErrorHint } from '@/lib/vimeo-errors'

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

type VimeoUploadApiResponse = {
  ok?: boolean
  error?: string
  code?: string
  videoUrl?: string
  embedUrl?: string | null
  vimeoId?: string
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

  const res = await fetch('/api/vimeo/upload', {
    method: 'POST',
    body: form,
  })

  onProgress?.(90)

  const data = (await res.json().catch(() => ({}))) as VimeoUploadApiResponse
  if (!res.ok || data.ok === false) {
    const hint = getVimeoUploadErrorHint(data.code)
    const message = data.error ?? 'فشل رفع الفيديو'
    throw new Error(`${message} ${hint}`)
  }

  const videoUrl = data.videoUrl?.trim()
  if (!videoUrl) {
    throw new Error('فشل رفع الفيديو: لم يُرجع رابط Vimeo')
  }

  onProgress?.(100)
  return {
    videoUrl,
    embedUrl: data.embedUrl ?? null,
    vimeoId: data.vimeoId,
  }
}
