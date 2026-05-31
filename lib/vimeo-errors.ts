export function getVimeoUploadErrorHint(code?: string): string {
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
      return 'قلل مدة الفيديو أو ارفع الحد الأقصى على السيرفر.'
    case 'INVALID_FILE_TYPE':
      return 'اختر ملف فيديو بصيغة مدعومة مثل mp4/webm/mov.'
    case 'RATE_LIMIT_EXCEEDED':
    case 'RATE_LIMITED':
      return 'انتظر قليلاً ثم حاول مرة أخرى (حد الرفع لكل معلم).'
    default:
      return 'راجع تفاصيل الخطأ وجرّب مرة أخرى.'
  }
}
