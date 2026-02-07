import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { formatDateAr, formatRelativeAr } from '@/lib/format-date'

export type UserListItem = {
  id: string
  fullName: string
  phone: string
  whatsapp?: string
  email?: string
  role: 'student' | 'teacher'
  joinDate: string
  lastActive: string
  status: string
}

export async function getUsersListForAdmin(): Promise<UserListItem[]> {
  const session = await getAdminSession()
  if (!session) return []
  try {
    await prisma.$connect()
    const users = await prisma.user.findMany({
      where: { role: { in: [UserRole.STUDENT, UserRole.TEACHER] } },
      orderBy: { createdAt: 'desc' },
    })
    return users.map((u) => {
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
      } catch {
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
  } catch (e) {
    console.error('getUsersListForAdmin', e)
    return []
  }
}
