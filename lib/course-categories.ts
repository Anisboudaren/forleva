/** Default Arabic categories used historically in the teacher form. */
export const DEFAULT_COURSE_CATEGORIES = [
  { name: 'برمجة', description: 'تعلم البرمجة والتطوير من الصفر حتى الاحتراف' },
  { name: 'تصميم', description: 'مهارات التصميم والإبداع البصري' },
  { name: 'تسويق', description: 'استراتيجيات التسويق الرقمي والنمو' },
  { name: 'أعمال', description: 'ريادة الأعمال والإدارة الحديثة' },
  { name: 'لغات', description: 'تعلم اللغات الأجنبية بطرق حديثة' },
  { name: 'أخرى', description: 'دورات متنوعة في مجالات أخرى' },
] as const

/** Simple Arabic-friendly slug for category URLs. */
export function slugifyCategoryName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return `category-${Date.now()}`

  const base = trimmed
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return base || `category-${Date.now()}`
}

export function normalizeCategoryName(name: string): string {
  return name.replace(/^ال/, '').trim()
}
