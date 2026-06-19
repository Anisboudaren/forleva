import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import type { CertificateRequestStatus } from '@/lib/schema-enums'

const VALID_STATUSES: CertificateRequestStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']

/**
 * GET /api/admin/certificate-requests — admin-only list.
 */
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')?.toUpperCase()
    const search = searchParams.get('search')?.trim() || ''

    const statusFilter =
      statusParam && VALID_STATUSES.includes(statusParam as CertificateRequestStatus)
        ? (statusParam as CertificateRequestStatus)
        : undefined

    const requests = await prisma.certificateRequest.findMany({
      where: {
        ...(statusFilter && { status: statusFilter }),
        ...(search && {
          OR: [
            { id: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { placeOfBirth: { contains: search, mode: 'insensitive' } },
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
            { user: { phone: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { course: { title: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, whatsapp: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (e) {
    console.error('GET /api/admin/certificate-requests', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
