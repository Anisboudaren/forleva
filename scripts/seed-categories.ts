import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import {
  DEFAULT_COURSE_CATEGORIES,
  slugifyCategoryName,
} from '../lib/course-categories'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaNeon({ connectionString: url })
const prisma = new PrismaClient({ adapter })

async function main() {
  for (let i = 0; i < DEFAULT_COURSE_CATEGORIES.length; i++) {
    const item = DEFAULT_COURSE_CATEGORIES[i]
    const slug = slugifyCategoryName(item.name)
    await prisma.courseCategory.upsert({
      where: { name: item.name },
      create: {
        name: item.name,
        slug,
        description: item.description,
        sortOrder: i,
        isActive: true,
      },
      update: {
        description: item.description,
        sortOrder: i,
        isActive: true,
      },
    })
  }

  const categories = await prisma.courseCategory.findMany()
  const byName = new Map(categories.map((c) => [c.name, c]))
  const courses = await prisma.course.findMany({
    where: { categoryId: null },
    select: { id: true, category: true },
  })

  let linked = 0
  for (const course of courses) {
    const match =
      byName.get(course.category) ||
      byName.get(course.category.replace(/^ال/, ''))
    if (!match) continue
    await prisma.course.update({
      where: { id: course.id },
      data: { categoryId: match.id, category: match.name },
    })
    linked++
  }

  console.log(`Seeded ${categories.length} categories, linked ${linked} courses`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
