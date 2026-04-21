'use client'

import { useEffect, useMemo, useState } from 'react'
import { getVimeoEmbedUrl } from '@/lib/vimeo'

type UploadResponse = {
  ok?: boolean
  error?: string
  code?: string
  requestId?: string
  mode?: 'sandbox-no-auth' | 'teacher-auth'
  provider?: string
  providerStatus?: number
  providerError?: string | null
  providerDeveloperMessage?: string | null
  providerRequestId?: string | null
  providerInvalidParameters?: unknown
  vimeoId?: string
  videoUrl?: string
  embedUrl?: string | null
  limits?: {
    maxSizeBytes?: number
    acceptedMimePrefix?: string
    maxNameLength?: number
    maxDurationSec?: number
  }
  upload?: {
    name?: string
    sizeBytes?: number
    mimeType?: string
  }
}

type TeacherCourseSummary = {
  id: string
  title: string
  videoUrl: string | null
  embedUrl?: string | null
  durationSec?: number | null
  privacyEmbed?: string | null
}
type ExistingVideosApiResponse = {
  ok?: boolean
  error?: string
  items?: TeacherCourseSummary[]
}


type ExistingVideoItem = {
  courseId: string
  title: string
  videoUrl: string
  embedUrl: string
  durationSec: number | null
  privacyEmbed: string | null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Unknown'
  const total = Math.floor(seconds)
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

function isDirectVideoFileUrl(input: string): boolean {
  const value = input.toLowerCase()
  return (
    value.includes('.mp4') ||
    value.includes('.webm') ||
    value.includes('.m3u8') ||
    value.includes('.mov')
  )
}

function getActionHint(code?: string) {
  switch (code) {
    case 'VIMEO_TOKEN_INVALID':
      return 'تأكد من VIMEO_ACCESS_TOKEN وأنه ما زال صالحاً.'
    case 'VIMEO_SCOPE_MISSING_UPLOAD':
      return 'أعد إنشاء التوكن مع صلاحية upload على Vimeo.'
    case 'VIMEO_FORBIDDEN_ACCOUNT':
      return 'الحساب أو التطبيق لا يملك إذن الرفع. تحقق من إعدادات التطبيق وحساب Vimeo.'
    case 'FILE_TOO_LARGE':
      return 'قلل حجم الفيديو أو صدّره بجودة أقل.'
    case 'DURATION_TOO_LONG':
      return 'قلل مدة الفيديو أو ارفع الحد الأقصى على السيرفر للاختبار.'
    case 'INVALID_FILE_TYPE':
      return 'اختر ملف فيديو بصيغة مدعومة مثل mp4/webm/mov.'
    default:
      return 'راجع تفاصيل الخطأ أدناه وجرّب مرة أخرى.'
  }
}

export function VimeoUploadSandbox() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('Sandbox upload')
  const [durationSec, setDurationSec] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [existingVideos, setExistingVideos] = useState<ExistingVideoItem[]>([])
  const [loadingExistingVideos, setLoadingExistingVideos] = useState(true)
  const [existingVideosError, setExistingVideosError] = useState<string | null>(null)
  const [selectedExistingVideo, setSelectedExistingVideo] = useState<ExistingVideoItem | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadExisting = async () => {
      setLoadingExistingVideos(true)
      setExistingVideosError(null)
      try {
        const res = await fetch('/api/vimeo/test-videos', {
          cache: 'no-store',
          headers: { 'x-vimeo-sandbox-test': '1' },
        })
        const payload = (await res.json().catch(() => null)) as ExistingVideosApiResponse | null
        if (!res.ok) {
          const apiError = payload?.error ?? null
          throw new Error(apiError || 'فشل تحميل الفيديوهات الحالية')
        }
        const list = Array.isArray(payload?.items) ? payload.items : []
        const normalized = list
          .map((course): ExistingVideoItem | null => {
            const rawVideoUrl = typeof course.videoUrl === 'string' ? course.videoUrl.trim() : ''
            if (!rawVideoUrl) return null
            const embedUrl = getVimeoEmbedUrl(rawVideoUrl)
            if (!embedUrl) return null
            return {
              courseId: course.id,
              title: course.title?.trim() || 'دورة بدون عنوان',
              videoUrl: rawVideoUrl,
              embedUrl: course.embedUrl?.trim() || embedUrl,
              durationSec: typeof course.durationSec === 'number' ? course.durationSec : null,
              privacyEmbed: course.privacyEmbed ?? null,
            }
          })
          .filter((item): item is ExistingVideoItem => Boolean(item))
        if (!cancelled) {
          setExistingVideos(normalized)
          if (!selectedExistingVideo && normalized.length > 0) {
            setSelectedExistingVideo(normalized[0])
          }
        }
      } catch (e) {
        if (!cancelled) {
          setExistingVideos([])
          setSelectedExistingVideo(null)
          setExistingVideosError(e instanceof Error ? e.message : 'فشل تحميل الفيديوهات الحالية')
        }
      } finally {
        if (!cancelled) setLoadingExistingVideos(false)
      }
    }

    void loadExisting()
    return () => {
      cancelled = true
    }
  }, [])

  const uploadedEmbedUrl = useMemo(
    () => result?.embedUrl ?? getVimeoEmbedUrl(result?.videoUrl),
    [result?.embedUrl, result?.videoUrl]
  )
  const embedUrl = selectedExistingVideo?.embedUrl ?? uploadedEmbedUrl
  const previewSrc = useMemo(() => {
    if (!embedUrl) return null
    try {
      const url = new URL(embedUrl)
      url.searchParams.set('title', '0')
      url.searchParams.set('byline', '0')
      url.searchParams.set('portrait', '0')
      url.searchParams.set('dnt', '1')
      return url.toString()
    } catch {
      const hasQuery = embedUrl.includes('?')
      return `${embedUrl}${hasQuery ? '&' : '?'}title=0&byline=0&portrait=0&dnt=1`
    }
  }, [embedUrl])

  const submit = async () => {
    if (!file || uploading) return
    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('name', name.trim() || file.name)
      if (durationSec !== null && Number.isFinite(durationSec) && durationSec > 0) {
        form.append('durationSec', String(Math.floor(durationSec)))
      }

      const res = await fetch('/api/vimeo/upload', {
        method: 'POST',
        headers: {
          'x-vimeo-sandbox-test': '1',
        },
        body: form,
      })
      const data = (await res.json().catch(() => ({}))) as UploadResponse
      if (!res.ok || data.ok === false) {
        setError(data.error ?? 'Upload failed')
        setResult(data)
        return
      }
      setResult(data)
      setSelectedExistingVideo(null)
    } catch {
      setError('Network error while uploading video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 pb-6 pt-28 sm:pt-32" dir="rtl">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Vimeo Sandbox (Temporary)</h1>
        <p className="text-sm text-gray-600">
          صفحة اختبار داخلية للتحقق من صلاحية الاعتمادات ورفع الفيديو واسترجاعه قبل استبدال المنطق الحالي.
        </p>
        <p className="text-xs text-amber-700">
          TODO: remove or lock this route before production release.
        </p>
        <p className="text-xs text-sky-700">
          هذا المسار يعمل بوضع اختبار Vimeo فقط وقد يتجاوز تحقق جلسة المنصة في بيئة التطوير.
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-2">
          <label htmlFor="video-name" className="block text-sm font-medium text-gray-800">
            Video name
          </label>
          <input
            id="video-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Sandbox upload"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="video-file" className="block text-sm font-medium text-gray-800">
            Video file
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={async (e) => {
              const nextFile = e.target.files?.[0] ?? null
              setFile(nextFile)
              setDurationSec(null)
              if (nextFile) {
                const video = document.createElement('video')
                video.preload = 'metadata'
                video.src = URL.createObjectURL(nextFile)
                await new Promise<void>((resolve) => {
                  video.onloadedmetadata = () => {
                    const nextDuration = Number.isFinite(video.duration) ? video.duration : null
                    setDurationSec(nextDuration)
                    URL.revokeObjectURL(video.src)
                    resolve()
                  }
                  video.onerror = () => {
                    URL.revokeObjectURL(video.src)
                    resolve()
                  }
                })
              }
            }}
            className="block w-full text-sm text-gray-700"
          />
          {file && (
            <p className="text-xs text-gray-500">
              {file.name} - {formatBytes(file.size)} - {file.type || 'unknown type'}
            </p>
          )}
          {durationSec !== null && (
            <p className="text-xs text-gray-500">Detected duration: {formatDuration(durationSec)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!file || uploading}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Test Vimeo Upload'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Preflight checks</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            Max size:{' '}
            {result?.limits?.maxSizeBytes
              ? formatBytes(result.limits.maxSizeBytes)
              : '500 MB (default)'}
          </li>
          <li>Accepted type: {result?.limits?.acceptedMimePrefix ?? 'video/*'}</li>
          <li>
            Max duration:{' '}
            {result?.limits?.maxDurationSec
              ? formatDuration(result.limits.maxDurationSec)
              : '4h (default)'}
          </li>
          <li>Recommended formats: mp4 (H.264/AAC), mov, webm</li>
          <li>Watch for: codec compatibility, large bitrate, unstable network during upload</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Vimeo requirements</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>Access token is configured in `.env` (`VIMEO_ACCESS_TOKEN`).</li>
          <li>Token has upload scope/permission.</li>
          <li>The Vimeo account/app plan allows uploads via API.</li>
        </ul>
      </section>

      {(error || (result?.ok === false && result)) && (
        <section className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-base font-semibold text-red-800">Error details</h2>
          <p className="text-sm text-red-700">{result?.error ?? error}</p>
          <p className="text-xs text-red-700">Code: {result?.code ?? 'UNKNOWN'}</p>
          <p className="text-xs text-red-700">Action: {getActionHint(result?.code)}</p>
          {result?.provider && (
            <div className="space-y-1 text-xs text-red-700">
              <p>Provider: {result.provider}</p>
              <p>Provider status: {result.providerStatus ?? '-'}</p>
              <p>Provider error: {result.providerError ?? '-'}</p>
              <p>Provider message: {result.providerDeveloperMessage ?? '-'}</p>
              <p>Provider request id: {result.providerRequestId ?? '-'}</p>
            </div>
          )}
          <p className="text-xs text-red-700">Local request id: {result?.requestId ?? '-'}</p>
        </section>
      )}

      {result && (
        <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-base font-semibold text-gray-900">API response</h2>
          <p className="text-xs text-gray-600">
            Mode: {result.mode ?? 'unknown'} | Request ID: {result.requestId ?? '-'}
          </p>
          <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}

      {previewSrc && (
        <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-base font-semibold text-gray-900">Playback preview</h2>
          <p className="text-xs text-gray-500">
            ملاحظة: إخفاء أزرار مثل Share / Like وروابط Vimeo يعتمد على إعدادات Vimeo وخطة الحساب، وليس
            من المعلمات فقط.
          </p>
          <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={previewSrc}
              title="Vimeo upload preview"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Existing videos</h2>
          <button
            type="button"
            onClick={() => {
              setLoadingExistingVideos(true)
              setExistingVideosError(null)
              void (async () => {
                try {
                  const res = await fetch('/api/vimeo/test-videos', {
                    cache: 'no-store',
                    headers: { 'x-vimeo-sandbox-test': '1' },
                  })
                  const payload = (await res.json().catch(() => null)) as ExistingVideosApiResponse | null
                  if (!res.ok) {
                    const apiError = payload?.error ?? null
                    throw new Error(apiError || 'فشل تحديث القائمة')
                  }
                  const list = Array.isArray(payload?.items) ? payload.items : []
                  const normalized = list
                    .map((course): ExistingVideoItem | null => {
                      const rawVideoUrl =
                        typeof course.videoUrl === 'string' ? course.videoUrl.trim() : ''
                      if (!rawVideoUrl) return null
                      const nextEmbedUrl = getVimeoEmbedUrl(rawVideoUrl)
                      if (!nextEmbedUrl) return null
                      return {
                        courseId: course.id,
                        title: course.title?.trim() || 'دورة بدون عنوان',
                        videoUrl: rawVideoUrl,
                        embedUrl: nextEmbedUrl,
                        durationSec: typeof course.durationSec === 'number' ? course.durationSec : null,
                        privacyEmbed: course.privacyEmbed ?? null,
                      }
                    })
                    .filter((item): item is ExistingVideoItem => Boolean(item))
                  setExistingVideos(normalized)
                  if (normalized.length === 0) {
                    setSelectedExistingVideo(null)
                    return
                  }
                  if (!selectedExistingVideo) {
                    setSelectedExistingVideo(normalized[0])
                    return
                  }
                  const stillExists = normalized.find((v) => v.courseId === selectedExistingVideo.courseId)
                  setSelectedExistingVideo(stillExists ?? normalized[0])
                } catch (e) {
                  setExistingVideosError(e instanceof Error ? e.message : 'فشل تحديث القائمة')
                } finally {
                  setLoadingExistingVideos(false)
                }
              })()
            }}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {loadingExistingVideos && <p className="text-sm text-gray-600">Loading existing videos...</p>}
        {!loadingExistingVideos && existingVideosError && (
          <p className="text-sm text-red-600">{existingVideosError}</p>
        )}
        {!loadingExistingVideos && !existingVideosError && existingVideos.length === 0 && (
          <p className="text-sm text-gray-600">No saved Vimeo videos were found in teacher courses.</p>
        )}

        {!loadingExistingVideos && !existingVideosError && existingVideos.length > 0 && (
          <div className="grid gap-2">
            {existingVideos.map((video) => {
              const isSelected = selectedExistingVideo?.courseId === video.courseId
              return (
                <button
                  key={video.courseId}
                  type="button"
                  onClick={() => setSelectedExistingVideo(video)}
                  className={`rounded-md border px-3 py-2 text-right text-sm transition ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium">{video.title}</p>
                  <p className="text-xs opacity-80">{video.videoUrl}</p>
                  <p className="text-xs opacity-70">
                    {video.durationSec ? `Duration: ${formatDuration(video.durationSec)}` : 'Duration: unknown'} |{' '}
                    Embed privacy: {video.privacyEmbed ?? 'unknown'}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {selectedExistingVideo && (
          <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <h3 className="text-sm font-semibold text-gray-900">Next video (&lt;video&gt;) example</h3>
            <p className="text-xs text-gray-600">
              هذا مثال يشغّل الرابط مباشرة عبر عنصر HTML video. يعمل فقط إذا كان الرابط ملف فيديو مباشر
              (مثل mp4/m3u8)، وليس رابط صفحة Vimeo عادي.
            </p>
            <code className="block overflow-x-auto rounded bg-white p-2 text-xs text-gray-700">
              {`<video controls preload="metadata" src="${selectedExistingVideo.videoUrl}" />`}
            </code>
            {isDirectVideoFileUrl(selectedExistingVideo.videoUrl) ? (
              <video
                controls
                preload="metadata"
                src={selectedExistingVideo.videoUrl}
                className="w-full rounded border border-gray-200 bg-black"
              />
            ) : (
              <p className="text-xs text-amber-700">
                الرابط الحالي ليس ملف فيديو مباشر، لذلك لن يعمل مع &lt;video&gt; مباشرة. استخدم Vimeo embed
                أعلاه أو رابط ملف مباشر من Vimeo API (expiring file URL).
              </p>
            )}
          </section>
        )}
      </section>
    </main>
  )
}
