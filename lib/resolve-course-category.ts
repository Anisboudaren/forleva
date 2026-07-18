import { prisma } from '@/lib/db'
import { normalizeCategoryName } from '@/lib/course-categories'

export async function resolveCourseCategory(input: {
  categoryId?: string | null
  categoryName?: string | null
}): Promise<{ categoryId: string | null; category: string }> {
  const categoryId =
    typeof input.categoryId === 'string' && input.categoryId.trim()
      ? input.categoryId.trim()
      : null
  const categoryName =
    typeof input.categoryName === 'string' && input.categoryName.trim()
      ? input.categoryName.trim()
      : null

  if (categoryId) {
    const byId = await prisma.courseCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true },
    })
    if (byId) return { categoryId: byId.id, category: byId.name }
  }

  if (categoryName) {
    const byName = await prisma.courseCategory.findFirst({
      where: {
        OR: [{ name: categoryName }, { name: normalizeCategoryName(categoryName) }],
        isActive: true,
      },
      select: { id: true, name: true },
    })
    if (byName) return { categoryId: byName.id, category: byName.name }
    return { categoryId: null, category: categoryName }
  }

  const fallback = await prisma.courseCategory.findFirst({
    where: { name: 'أخرى', isActive: true },
    select: { id: true, name: true },
  })
  if (fallback) return { categoryId: fallback.id, category: fallback.name }
  return { categoryId: null, category: 'أخرى' }
}
