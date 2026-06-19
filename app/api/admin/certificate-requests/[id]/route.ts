import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import type { CertificateRequestStatus } from '@/lib/schema-enums'

const VALID_STATUSES: CertificateRequestStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']

/**
 * PATCH /api/admin/certificate-requests/[id] — update status or admin notes.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const statusInput = (body.status as string)?.toUpperCase()
    const adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim() || null : undefined

    const updateData: { status?: CertificateRequestStatus; adminNotes?: string | null } = {}
    if (statusInput && VALID_STATUSES.includes(statusInput as CertificateRequestStatus)) {
      updateData.status = statusInput as CertificateRequestStatus
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'لا يوجد تحديث صالح' }, { status: 400 })
    }

    const request = await prisma.certificateRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, whatsapp: true } },
        course: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(request)
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }
    console.error('PATCH /api/admin/certificate-requests/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
