import {
  buildImageUploadErrorMessage,
  type ImageUploadFailureDetails,
} from '@/lib/image-upload-errors'

export type DocumentUploadResult = {
  url: string
  key: string
}

export type DocumentUploadApiResponse = ImageUploadFailureDetails & {
  ok?: boolean
  url?: string
  key?: string
}

export class DocumentUploadError extends Error {
  details: ImageUploadFailureDetails

  constructor(message: string, details: ImageUploadFailureDetails = {}) {
    super(message)
    this.name = 'DocumentUploadError'
    this.details = details
  }
}

export async function runDocumentUpload(
  file: File,
  options?: { prefix?: string; name?: string }
): Promise<DocumentUploadResult> {
  const form = new FormData()
  form.append('file', file)
  if (options?.prefix) form.append('prefix', options.prefix)
  if (options?.name) form.append('name', options.name)

  let res: Response
  try {
    res = await fetch('/api/upload/document', {
      method: 'POST',
      body: form,
    })
  } catch (networkErr) {
    const details: ImageUploadFailureDetails = {
      code: 'NETWORK_ERROR',
      error: 'تعذر الاتصال بالسيرفر أثناء رفع الملف',
      detail: networkErr instanceof Error ? networkErr.message : String(networkErr),
    }
    throw new DocumentUploadError(buildImageUploadErrorMessage(details), details)
  }

  const contentType = res.headers.get('content-type') ?? ''
  let data: DocumentUploadApiResponse = {}

  if (contentType.includes('application/json')) {
    data = (await res.json().catch(() => ({}))) as DocumentUploadApiResponse
  } else {
    const raw = await res.text().catch(() => '')
    const details: ImageUploadFailureDetails = {
      code: 'NON_JSON_RESPONSE',
      error: 'استجابة غير متوقعة من السيرفر أثناء رفع الملف',
      detail: raw ? raw.slice(0, 300) : res.statusText,
      httpStatus: res.status,
    }
    throw new DocumentUploadError(buildImageUploadErrorMessage(details), details)
  }

  if (!res.ok || data.ok === false) {
    const details: ImageUploadFailureDetails = {
      code: data.code,
      error: data.error,
      hint: data.hint,
      detail: data.detail,
      requestId: data.requestId,
      httpStatus: res.status,
      issues: data.issues,
    }
    throw new DocumentUploadError(buildImageUploadErrorMessage(details), details)
  }

  const url = data.url?.trim()
  const key = data.key?.trim()
  if (!url || !key) {
    throw new DocumentUploadError('فشل رفع الملف: لم يُرجع السيرفر رابط الملف')
  }

  return { url, key }
}
