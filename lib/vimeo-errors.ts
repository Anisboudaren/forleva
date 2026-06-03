export type VimeoUploadFailureDetails = {
  code?: string
  error?: string
  requestId?: string
  httpStatus?: number
  provider?: string
  providerStatus?: number
  providerError?: string | null
  providerDeveloperMessage?: string | null
  providerRequestId?: string | null
  providerInvalidParameters?: unknown
  detail?: string
  fileName?: string
  fileSizeBytes?: number
  mimeType?: string
}

export function getVimeoUploadErrorHint(code?: string): string {
  switch (code) {
    case 'VIMEO_TOKEN_MISSING':
      return 'أضف VIMEO_ACCESS_TOKEN في بيئة السيرفر (PM2 / .env) وأعد التشغيل.'
    case 'VIMEO_TOKEN_INVALID':
      return 'تأكد من VIMEO_ACCESS_TOKEN وأنه ما زال صالحاً.'
    case 'VIMEO_SCOPE_MISSING_UPLOAD':
      return 'أعد إنشاء التوكن مع صلاحية upload على Vimeo.'
    case 'VIMEO_FORBIDDEN_ACCOUNT':
      return 'الحساب أو التطبيق لا يملك إذن الرفع. تحقق من إعدادات التطبيق وحساب Vimeo.'
    case 'VIMEO_UPLOAD_PROVIDER_FAILED':
      return 'تحقق من حساب Vimeo وحد التخزين/الرفع.'
    case 'AUTH_NO_SESSION':
      return 'سجّل الدخول كمعلّم ثم أعد المحاولة (كوكي الجلسة).'
    case 'AUTH_ROLE_NOT_TEACHER':
      return 'يجب أن يكون الحساب معلّماً لرفع الفيديو.'
    case 'FILE_TOO_LARGE':
      return 'قلل حجم الفيديو أو صدّره بجودة أقل.'
    case 'DURATION_TOO_LONG':
      return 'قلل مدة الفيديو أو ارفع الحد الأقصى على السيرفر.'
    case 'INVALID_FILE_TYPE':
      return 'اختر ملف فيديو بصيغة مدعومة مثل mp4/webm/mov.'
    case 'RATE_LIMIT_EXCEEDED':
    case 'RATE_LIMITED':
      return 'انتظر قليلاً ثم حاول مرة أخرى (حد الرفع لكل معلم).'
    case 'NETWORK_ERROR':
      return 'تحقق من الاتصال بالإنترنت أو أن السيرفر يعمل.'
    case 'NON_JSON_RESPONSE':
      return 'غالباً حد حجم الطلب على nginx أو انتهاء مهلة الرفع — راجع إعدادات السيرفر.'
    case 'UPLOAD_FAILED':
      return 'راجع سجلات PM2 للتفاصيل (ابحث عن requestId).'
    default:
      return 'راجع تفاصيل الخطأ في Console وجرّب مرة أخرى.'
  }
}

export function buildVimeoUploadErrorMessage(details: VimeoUploadFailureDetails): string {
  const parts: string[] = []
  if (details.error) parts.push(details.error)
  const hint = getVimeoUploadErrorHint(details.code)
  if (hint) parts.push(hint)
  const providerLine =
    details.providerDeveloperMessage?.trim() || details.providerError?.trim() || ''
  if (providerLine) parts.push(providerLine)
  if (details.detail?.trim()) parts.push(details.detail.trim())
  if (details.requestId) parts.push(`[${details.requestId}]`)
  return parts.filter(Boolean).join(' ') || 'فشل رفع الفيديو'
}

/** Structured log for browser DevTools or PM2 stdout. */
export function logVimeoUploadError(
  channel: 'client' | 'server',
  details: VimeoUploadFailureDetails
): void {
  const message = buildVimeoUploadErrorMessage(details)
  console.error(`[vimeo-upload:${channel}]`, {
    message,
    ...details,
  })
}
