const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]

function toDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date)
}

export function formatDateAr(date: Date | string): string {
  const d = toDate(date)
  const day = d.getDate()
  const m = MONTHS_AR[d.getMonth()]
  const y = d.getFullYear()
  return `${day} ${m} ${y}`
}

export function formatRelativeAr(date: Date | string): string {
  const d = toDate(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 1) return "الآن"
  if (diffM < 60) return `منذ ${diffM} دقيقة`
  if (diffH < 24) return diffH === 1 ? "منذ ساعة" : `منذ ${diffH} ساعة`
  if (diffD < 7) return diffD === 1 ? "منذ يوم" : `منذ ${diffD} أيام`
  if (diffD < 30) return diffD < 14 ? "منذ أسبوع" : "منذ أسبوعين"
  return formatDateAr(d)
}
