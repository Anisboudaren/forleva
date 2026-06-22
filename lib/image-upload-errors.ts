export type ImageUploadFailureDetails = {
  code?: string
  error?: string
  hint?: string
  detail?: string
  requestId?: string
  httpStatus?: number
  issues?: Array<{ code: string; message: string; hint?: string }>
}

export function buildImageUploadErrorMessage(details: ImageUploadFailureDetails): string {
  const parts: string[] = []

  if (details.error?.trim()) {
    parts.push(details.error.trim())
  } else {
    parts.push('فشل رفع الصورة')
  }

  if (details.hint?.trim()) {
    parts.push(details.hint.trim())
  }

  if (details.issues?.length) {
    const issueText = details.issues
      .map((issue) => issue.hint || issue.message)
      .filter(Boolean)
      .join(' · ')
    if (issueText) parts.push(issueText)
  }

  if (details.detail?.trim()) {
    parts.push(details.detail.trim())
  }

  if (details.requestId?.trim()) {
    parts.push(`رقم الطلب: ${details.requestId.slice(0, 8)}`)
  }

  return parts.join(' — ')
}

export function mapS3UploadError(err: unknown): ImageUploadFailureDetails {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  const metadata = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } }
  const providerCode = metadata.Code ?? metadata.name
  const httpStatus = metadata.$metadata?.httpStatusCode

  if (lower.includes('length') && lower.includes('should be 32')) {
    return {
      code: 'INVALID_ACCESS_KEY_FORMAT',
      error: 'Access Key ID غير صالح',
      hint: 'استخدم CLOUDFLARE_S3_ACCESS_KEY_ID أو ACCESS_KEY_ID — 32 حرف hex من R2 (ليس REPLACE_WITH ولا API_TOKEN)',
      detail: message,
      httpStatus,
    }
  }

  if (lower.includes('no value provided for input http label: bucket')) {
    return {
      code: 'STORAGE_BUCKET_MISSING',
      error: 'إعدادات التخزين غير مكتملة',
      hint: 'أضف CLOUDFLARE_S3_BUCKET في ملف .env ثم أعد تشغيل السيرفر',
      detail: message,
    }
  }

  if (
    providerCode === 'InvalidAccessKeyId' ||
    providerCode === 'SignatureDoesNotMatch' ||
    lower.includes('unauthorized') ||
    lower.includes('access key') ||
    lower.includes('signature') ||
    httpStatus === 401 ||
    httpStatus === 403
  ) {
    return {
      code: 'STORAGE_AUTH_FAILED',
      error: 'رفض Cloudflare R2 بيانات الاعتماد (Unauthorized)',
      hint: 'أنشئ R2 API Token جديداً: Cloudflare → R2 → Manage R2 API Tokens → Object Read & Write. ضع Access Key ID و Secret Access Key في .env (ليس Account ID)',
      detail: message,
      httpStatus,
    }
  }

  if (lower.includes('enotfound') && lower.includes('r2.cloudflarestorage.com')) {
    return {
      code: 'STORAGE_ENDPOINT_DNS',
      error: 'تعذر الوصول إلى دلو R2',
      hint: 'فعّل CLOUDFLARE_S3_FORCE_PATH_STYLE=true (مطلوب لـ R2)',
      detail: message,
      httpStatus,
    }
  }

  if (
    lower.includes('cloudflarestream.com') ||
    lower.includes('getaddrinfo') ||
    lower.includes('econnrefused') ||
    lower.includes('network') ||
    lower.includes('timeout')
  ) {
    return {
      code: 'STORAGE_ENDPOINT_UNREACHABLE',
      error: 'تعذر الاتصال بخدمة التخزين',
      hint: 'تأكد أن CLOUDFLARE_S3_ENDPOINT أو CLOUDFLARE_ACCOUNT_ID يشير إلى R2',
      detail: message,
      httpStatus,
    }
  }

  if (providerCode === 'NoSuchBucket' || lower.includes('nosuchbucket')) {
    return {
      code: 'STORAGE_BUCKET_NOT_FOUND',
      error: 'دلو التخزين غير موجود',
      hint: 'تأكد من اسم الدلو في CLOUDFLARE_S3_BUCKET',
      detail: message,
      httpStatus,
    }
  }

  return {
    code: 'UPLOAD_FAILED',
    error: 'فشل رفع الصورة إلى التخزين السحابي',
    hint: 'تحقق من إعدادات Cloudflare R2 في .env وأعد تشغيل npm run dev',
    detail: message,
    httpStatus,
  }
}
