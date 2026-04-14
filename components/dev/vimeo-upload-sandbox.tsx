'use client'

import { useMemo, useState } from 'react'
import { getVimeoEmbedUrl } from '@/lib/vimeo'

type UploadResponse = {
  ok?: boolean
  error?: string
  code?: string
  provider?: string
  vimeoId?: string
  videoUrl?: string
  upload?: {
    name?: string
    sizeBytes?: number
    mimeType?: string
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

export function VimeoUploadSandbox() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('Sandbox upload')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResponse | null>(null)

  const embedUrl = useMemo(() => getVimeoEmbedUrl(result?.videoUrl), [result?.videoUrl])

  const submit = async () => {
    if (!file || uploading) return
    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('name', name.trim() || file.name)

      const res = await fetch('/api/vimeo/upload', {
        method: 'POST',
        body: form,
      })
      const data = (await res.json().catch(() => ({}))) as UploadResponse
      if (!res.ok || data.ok === false) {
        setError(data.error ?? 'Upload failed')
        setResult(data)
        return
      }
      setResult(data)
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
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-700"
          />
          {file && (
            <p className="text-xs text-gray-500">
              {file.name} - {formatBytes(file.size)} - {file.type || 'unknown type'}
            </p>
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

      {result && (
        <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-base font-semibold text-gray-900">API response</h2>
          <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}

      {embedUrl && (
        <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-base font-semibold text-gray-900">Playback preview</h2>
          <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`${embedUrl}?title=0&byline=0&portrait=0`}
              title="Vimeo upload preview"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
            />
          </div>
        </section>
      )}
    </main>
  )
}
