import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'
import { formatDateAr } from '@/lib/format-date'
import { DashboardContentCard } from '@/components/dashboard/DashboardCard'
import { Award, Download, Share2, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import { OrderCertificateSection } from '@/components/student/order-certificate-section'
import {
  CERTIFICATE_STATUS_LABELS,
  CERTIFICATE_STATUS_STYLES,
  CERTIFICATE_TYPE_LABELS,
} from '@/lib/certificate-constants'
import type { CertificateRequestStatus } from '@/lib/schema-enums'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'
import { isCertificateImageMime } from '@/lib/certificate-file'
import Link from 'next/link'

function shortCertId(id: string) {
  return `CERT-${id.slice(0, 8).toUpperCase()}`
}

export default async function CertificatesPage() {
  const session = await getUserSession()

  if (!session || session.role !== 'STUDENT') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للطلاب فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب طالب للوصول إلى شهاداتك.</p>
      </div>
    )
  }

  const requests = await prisma.certificateRequest.findMany({
    where: { userId: session.userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          teacher: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length
  const inProgressCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'PROCESSING'
  ).length
  const latestRequest = requests[0]

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            <GradientText
              text="شهاداتي"
              gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
            />
          </h1>
          <p className="text-base text-gray-600">
            طلبات الشهادات وحالتها — تظهر هنا بعد تقديم الطلب
          </p>
        </div>
        <OrderCertificateSection />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardContentCard title="إجمالي الطلبات" icon={Award}>
          <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
          <p className="text-sm text-gray-600 mt-1">طلب شهادة</p>
        </DashboardContentCard>

        <DashboardContentCard title="مكتملة" icon={CheckCircle2}>
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
          <p className="text-sm text-gray-600 mt-1">شهادة جاهزة</p>
        </DashboardContentCard>

        <DashboardContentCard title="قيد المعالجة" icon={Clock}>
          <div className="text-3xl font-bold text-amber-600">{inProgressCount}</div>
          <p className="text-sm text-gray-600 mt-1">
            {latestRequest ? `آخر طلب: ${formatDateAr(latestRequest.createdAt)}` : 'لا توجد طلبات بعد'}
          </p>
        </DashboardContentCard>
      </div>

      <DashboardContentCard
        title="طلبات الشهادات"
        description={
          requests.length
            ? `${requests.length} طلب • ${completedCount} مكتملة`
            : 'لم تقدّم أي طلب شهادة بعد'
        }
        icon={Award}
      >
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد طلبات شهادات</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              بعد إتمام دورة مؤكدة، اضغط «طلب شهادة» لإرسال طلبك وسيظهر هنا مع حالته.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {requests.map((req) => {
              const status = req.status as CertificateRequestStatus
              const isCompleted = status === 'COMPLETED'
              const hasCertificateFile = Boolean(req.certificateFileKey)
              const courseImage = req.course.imageUrl
              const fileUrl = `/api/student/certificate-requests/${req.id}/file`

              return (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-amber-600 via-yellow-600 to-yellow-500 p-6 overflow-hidden">
                    {courseImage ? (
                      <Image
                        src={getSafeCourseImageUrl(courseImage)}
                        alt={req.course.title}
                        fill
                        className="object-cover opacity-30"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/logo but white.png"
                          alt="Logo"
                          width={120}
                          height={120}
                          className="object-contain opacity-50"
                        />
                      </div>
                    )}

                    <div className="absolute top-4 right-4 z-20">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${CERTIFICATE_STATUS_STYLES[status]}`}
                      >
                        {status === 'PROCESSING' && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {CERTIFICATE_STATUS_LABELS[status]}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 left-4 z-20">
                      <p className="text-white/90 text-xs font-medium">
                        {CERTIFICATE_TYPE_LABELS[req.certificateType]}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-gray-100">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{req.course.title}</h3>
                      {req.course.teacher?.fullName && (
                        <p className="text-sm text-gray-600">{req.course.teacher.fullName}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">تاريخ الطلب</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDateAr(req.createdAt)}
                        </p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
                        <p className="text-sm font-mono text-gray-600">{shortCertId(req.id)}</p>
                      </div>
                    </div>

                    {status === 'PENDING' && (
                      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 mb-4">
                        طلبك قيد المراجعة. سيتواصل معك الفريق قريباً.
                      </p>
                    )}
                    {status === 'PROCESSING' && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
                        جاري إعداد شهادتك. سنُعلمك عند اكتمالها.
                      </p>
                    )}
                    {status === 'CANCELLED' && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                        تم إلغاء هذا الطلب. يمكنك تقديم طلب جديد إن لزم.
                      </p>
                    )}

                    {status === 'COMPLETED' && !hasCertificateFile && (
                      <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
                        تم إكمال طلبك. سيظهر ملف الشهادة هنا فور رفعه من الإدارة.
                      </p>
                    )}
                    {status === 'COMPLETED' && hasCertificateFile && (
                      <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
                        شهادتك جاهزة! يمكنك تحميلها أدناه.
                      </p>
                    )}

                    {isCompleted && hasCertificateFile && isCertificateImageMime(req.certificateFileMime) && (
                      <div className="mb-4 rounded-lg border border-amber-100 overflow-hidden bg-amber-50/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${fileUrl}?disposition=inline`}
                          alt={`شهادة ${req.course.title}`}
                          className="w-full max-h-72 object-contain"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isCompleted && hasCertificateFile ? (
                        <a
                          href={fileUrl}
                          download={req.certificateFileName ?? 'certificate'}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          تحميل الشهادة
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                        >
                          <Download className="h-4 w-4" />
                          غير متاح
                        </button>
                      )}
                      {isCompleted && hasCertificateFile ? (
                        <Link
                          href={`${fileUrl}?disposition=inline`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          فتح
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                        >
                          <Share2 className="h-4 w-4" />
                          مشاركة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DashboardContentCard>
    </div>
  )
}
