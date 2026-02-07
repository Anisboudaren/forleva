import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { formatDateAr, formatRelativeAr } from '@/lib/format-date'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    await prisma.$connect()
    const users = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
      orderBy: { createdAt: 'desc' },
    })
    const list = users.map((u) => ({
      id: u.id,
      fullName: u.fullName ?? '—',
      phone: u.phone ?? '—',
      whatsapp: u.whatsapp ?? undefined,
      email: u.email ?? undefined,
      role: u.role === 'SUPER_ADMIN' ? 'super_admin' : 'admin',
      joinDate: formatDateAr(u.createdAt),
      lastActive: formatRelativeAr(u.updatedAt),
      status: u.status.toLowerCase(),
    }))
    return NextResponse.json(list)
  } catch (e) {
    console.error('GET /api/admin/admins', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
