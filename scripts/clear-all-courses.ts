/**
 * Deletes all courses and cascaded data (orders, sections, progress, reviews, Q&A).
 *
 * Usage:
 *   CONFIRM_CLEAR_COURSES=yes npx tsx scripts/clear-all-courses.ts
 */
import 'dotenv/config'
import { prisma } from '../lib/db'

async function counts() {
  const [
    courses,
    orders,
    sections,
    items,
    progress,
    reviews,
    questions,
    notes,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.order.count(),
    prisma.courseSection.count(),
    prisma.courseSectionItem.count(),
    prisma.courseItemProgress.count(),
    prisma.review.count(),
    prisma.courseQuestion.count(),
    prisma.courseNote.count(),
  ])
  return { courses, orders, sections, items, progress, reviews, questions, notes }
}

async function main() {
  if (process.env.CONFIRM_CLEAR_COURSES !== 'yes') {
    console.error(
      'Refusing to run. Set CONFIRM_CLEAR_COURSES=yes to delete all courses and related records.'
    )
    process.exit(1)
  }

  console.log('Before delete:')
  console.table(await counts())

  const deleted = await prisma.course.deleteMany()

  console.log(`\nDeleted ${deleted.count} course(s).`)
  console.log('\nAfter delete:')
  console.table(await counts())

  const auditOrphans = await prisma.auditLog.deleteMany({
    where: { entityType: 'course' },
  })
  if (auditOrphans.count > 0) {
    console.log(`Removed ${auditOrphans.count} course audit log row(s).`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
