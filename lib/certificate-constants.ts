import type { CertificateRequestStatus, CertificateType } from '@/lib/schema-enums'

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  FREE: 'شهادة مشاركة مجانية',
  NATIONAL: 'شهادة معترف بها وطنياً',
  INTERNATIONAL: 'شهادة معترف بها دولياً',
}

export const CERTIFICATE_STATUS_LABELS: Record<CertificateRequestStatus, string> = {
  PENDING: 'قيد الانتظار',
  PROCESSING: 'قيد المعالجة',
  COMPLETED: 'مكتملة',
  CANCELLED: 'ملغاة',
}

export const CERTIFICATE_STATUS_STYLES: Record<CertificateRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-amber-100 text-amber-800 border-amber-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
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
