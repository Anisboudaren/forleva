import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { Award, Download, Share2, Calendar, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { GradientText } from "@/components/text/gradient-text"

export default function CertificatesPage() {
  const certificates = [
    {
      id: 1,
      courseName: "قواعد البيانات",
      instructor: "أميرة بن عودة",
      completedDate: "15 ديسمبر 2024",
      certificateId: "CERT-2024-001",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      courseName: "التسويق الرقمي",
      instructor: "عمر بلقاسم",
      completedDate: "8 نوفمبر 2024",
      certificateId: "CERT-2024-002",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="شهاداتي" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          شهادات الإتمام التي حصلت عليها من الدورات المكتملة
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardContentCard title="إجمالي الشهادات" icon={Award}>
          <div className="text-3xl font-bold text-gray-900">{certificates.length}</div>
          <p className="text-sm text-gray-600 mt-1">شهادة معتمدة</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="آخر شهادة" icon={Calendar}>
          <div className="text-lg font-bold text-gray-900">15 ديسمبر 2024</div>
          <p className="text-sm text-gray-600 mt-1">تاريخ الإتمام</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="الحالة" icon={CheckCircle2}>
          <div className="text-lg font-bold text-green-600">نشطة</div>
          <p className="text-sm text-gray-600 mt-1">جميع الشهادات صالحة</p>
        </DashboardContentCard>
      </div>

      {/* Certificates List */}
      <DashboardContentCard
        title="شهاداتي"
        description={`${certificates.length} شهادة إتمام`}
        icon={Award}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-48 bg-gradient-to-br from-amber-600 via-yellow-600 to-yellow-500 p-6 overflow-hidden">
                {/* Background Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/logo but white.png"
                    alt="Logo"
                    width={120}
                    height={120}
                    className="object-contain opacity-50"
                  />
                </div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Image
                    src="/badge.png"
                    alt="Certificate Badge"
                    width={80}
                    height={80}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              <div className="p-6 bg-white border-t border-gray-100">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{cert.courseName}</h3>
                  <p className="text-sm text-gray-600 mb-4">{cert.instructor}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">تاريخ الإتمام</p>
                    <p className="text-sm font-semibold text-gray-900">{cert.completedDate}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">رقم الشهادة</p>
                    <p className="text-sm font-mono text-gray-600">{cert.certificateId}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    تحميل
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="h-4 w-4" />
                    مشاركة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

