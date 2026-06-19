import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import { parseCertificateType } from '@/lib/certificate-constants'

/**
 * GET /api/student/certificate-requests — list current student's requests.
 */
export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'متاح للطلاب فقط' }, { status: 403 })
  }

  try {
    const requests = await prisma.certificateRequest.findMany({
      where: { userId: session.userId },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  } catch (e) {
    console.error('GET /api/student/certificate-requests', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

/**
 * POST /api/student/certificate-requests — submit certificate request.
 */
export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'متاح للطلاب فقط' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const courseId = (body.courseId as string)?.trim()
    const certificateType = parseCertificateType(body.certificateType)
    const fullName = (body.fullName as string)?.trim()
    const placeOfBirth = (body.placeOfBirth as string)?.trim()
    const dateOfBirthRaw = (body.dateOfBirth as string)?.trim()
    const note = (body.note as string)?.trim() || null

    if (!courseId || !certificateType || !fullName || !placeOfBirth || !dateOfBirthRaw) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب تعبئتها' }, { status: 400 })
    }

    const dateOfBirth = new Date(dateOfBirthRaw)
    if (Number.isNaN(dateOfBirth.getTime())) {
      return NextResponse.json({ error: 'تاريخ الولادة غير صالح' }, { status: 400 })
    }

    const confirmedOrder = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        courseId,
        status: 'CONFIRMED',
      },
    })
    if (!confirmedOrder) {
      return NextResponse.json(
        { error: 'يجب أن تكون مسجلاً ومؤكداً في هذه الدورة لطلب الشهادة' },
        { status: 403 }
      )
    }

    const existingPending = await prisma.certificateRequest.findFirst({
      where: {
        userId: session.userId,
        courseId,
        certificateType,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    })
    if (existingPending) {
      return NextResponse.json(
        { error: 'لديك طلب شهادة قيد المعالجة لهذه الدورة ونوع الشهادة' },
        { status: 409 }
      )
    }

    const request = await prisma.certificateRequest.create({
      data: {
        userId: session.userId,
        courseId,
        certificateType,
        fullName,
        placeOfBirth,
        dateOfBirth,
        note,
      },
      include: { course: { select: { id: true, title: true } } },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (e) {
    console.error('POST /api/student/certificate-requests', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال الطلب' }, { status: 500 })
  }
}
