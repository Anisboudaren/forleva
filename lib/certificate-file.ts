export const STUDENT_CERTIFICATES_R2_PREFIX = 'students-certificates'

export const ALLOWED_CERTIFICATE_FILE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

export type CertificateFileMime = (typeof ALLOWED_CERTIFICATE_FILE_MIMES)[number]

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

export function certificateMimeToExt(mime: string): string {
  return MIME_TO_EXT[mime] ?? 'bin'
}

export function isCertificateImageMime(mime: string | null | undefined): boolean {
  return Boolean(mime?.startsWith('image/'))
}

export function buildCertificateR2Key(requestId: string, ext: string): string {
  const safeId = requestId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)
  const stamp = Date.now()
  return `${STUDENT_CERTIFICATES_R2_PREFIX}/${safeId}/certificate-${stamp}.${ext}`
}
