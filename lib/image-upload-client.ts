import {
  buildImageUploadErrorMessage,
  type ImageUploadFailureDetails,
} from '@/lib/image-upload-errors'

export type ImageUploadResult = {
  url: string
  key: string
}

export type ImageUploadApiResponse = ImageUploadFailureDetails & {
  ok?: boolean
  url?: string
  key?: string
}

export class ImageUploadError extends Error {
  details: ImageUploadFailureDetails

  constructor(message: string, details: ImageUploadFailureDetails = {}) {
    super(message)
    this.name = 'ImageUploadError'
    this.details = details
  }
}

function failureFromApi(
  data: ImageUploadApiResponse,
  httpStatus: number,
  file: File
): ImageUploadFailureDetails {
  return {
    code: data.code,
    error: data.error,
    hint: data.hint,
    detail: data.detail,
    requestId: data.requestId,
    httpStatus,
    issues: data.issues,
  }
}

export async function runImageUpload(
  file: File,
  options?: { prefix?: string; name?: string }
): Promise<ImageUploadResult> {
  const form = new FormData()
  form.append('file', file)
  if (options?.prefix) form.append('prefix', options.prefix)
  if (options?.name) form.append('name', options.name)

  let res: Response
  try {
    res = await fetch('/api/upload/image', {
      method: 'POST',
      body: form,
    })
  } catch (networkErr) {
    const details: ImageUploadFailureDetails = {
      code: 'NETWORK_ERROR',
      error: 'تعذر الاتصال بالسيرفر أثناء رفع الصورة',
      detail: networkErr instanceof Error ? networkErr.message : String(networkErr),
    }
    throw new ImageUploadError(buildImageUploadErrorMessage(details), details)
  }

  const contentType = res.headers.get('content-type') ?? ''
  let data: ImageUploadApiResponse = {}

  if (contentType.includes('application/json')) {
    data = (await res.json().catch(() => ({}))) as ImageUploadApiResponse
  } else {
    const raw = await res.text().catch(() => '')
    const details: ImageUploadFailureDetails = {
      code: 'NON_JSON_RESPONSE',
      error: 'استجابة غير متوقعة من السيرفر أثناء رفع الصورة',
      detail: raw ? raw.slice(0, 300) : res.statusText,
      httpStatus: res.status,
    }
    throw new ImageUploadError(buildImageUploadErrorMessage(details), details)
  }

  if (!res.ok || data.ok === false) {
    const details = failureFromApi(data, res.status, file)
    throw new ImageUploadError(buildImageUploadErrorMessage(details), details)
  }

  const url = data.url?.trim()
  const key = data.key?.trim()
  if (!url || !key) {
    const details: ImageUploadFailureDetails = {
      code: 'MISSING_URL',
      error: 'فشل رفع الصورة: لم يُرجع السيرفر رابط الصورة',
      requestId: data.requestId,
      httpStatus: res.status,
    }
    throw new ImageUploadError(buildImageUploadErrorMessage(details), details)
  }

  return { url, key }
}
