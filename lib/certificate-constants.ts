import type { CertificateType } from '@/lib/schema-enums'

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  FREE: 'شهادة مشاركة مجانية',
  NATIONAL: 'شهادة معترف بها وطنياً',
  INTERNATIONAL: 'شهادة معترف بها دولياً',
}

const TYPE_MAP: Record<string, CertificateType> = {
  free: 'FREE',
  national: 'NATIONAL',
  international: 'INTERNATIONAL',
  FREE: 'FREE',
  NATIONAL: 'NATIONAL',
  INTERNATIONAL: 'INTERNATIONAL',
}

export function parseCertificateType(value: unknown): CertificateType | null {
  const raw = (value as string)?.trim()
  return raw ? TYPE_MAP[raw] ?? null : null
}
