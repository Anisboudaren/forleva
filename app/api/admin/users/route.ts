import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { formatDateAr, formatRelativeAr } from '@/lib/format-date'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    await prisma.$connect()
    const users = await prisma.user.findMany({
      where: { role: { in: [UserRole.STUDENT, UserRole.TEACHER] } },
      orderBy: { createdAt: 'desc' },
    })
    const list = users.map((u) => {
      try {
        return {
          id: u.id,
          fullName: u.fullName ?? '—',
          phone: u.phone ?? '—',
          whatsapp: u.whatsapp ?? undefined,
          email: u.email ?? undefined,
          role: u.role === UserRole.TEACHER ? 'teacher' : 'student',
          joinDate: formatDateAr(u.createdAt),
          lastActive: formatRelativeAr(u.updatedAt),
          status: String(u.status).toLowerCase(),
        }
      } catch (rowError) {
        console.error('GET /api/admin/users row map error', u.id, rowError)
        return {
          id: u.id,
          fullName: u.fullName ?? '—',
          phone: u.phone ?? '—',
          whatsapp: u.whatsapp ?? undefined,
          email: u.email ?? undefined,
          role: u.role === UserRole.TEACHER ? 'teacher' : 'student',
          joinDate: '—',
          lastActive: '—',
          status: 'active',
        }
      }
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error('GET /api/admin/users', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
