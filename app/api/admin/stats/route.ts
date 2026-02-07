import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { UserRole, AccountStatus } from '@prisma/client'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    await prisma.$connect()

    const [studentCount, teacherCount, adminCount, activeUsers, newThisMonth] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.user.count({ where: { role: UserRole.TEACHER } }),
      prisma.user.count({
        where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] } },
      }),
      prisma.user.count({
        where: {
          role: { in: [UserRole.STUDENT, UserRole.TEACHER] },
          status: AccountStatus.ACTIVE,
        },
      }),
      prisma.user.count({
        where: {
          role: { in: [UserRole.STUDENT, UserRole.TEACHER] },
          createdAt: { gte: startOfThisMonth() },
        },
      }),
    ])

    const totalUsers = studentCount + teacherCount

    return NextResponse.json({
      totalUsers,
      studentCount,
      teacherCount,
      totalAdmins: adminCount,
      activeUsers,
      newThisMonth,
      totalCourses: 0,
    })
  } catch (e) {
    console.error('GET /api/admin/stats', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

function startOfThisMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}
