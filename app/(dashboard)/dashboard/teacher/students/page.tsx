import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { Users, UserPlus, GraduationCap, Award, Search, Mail, Calendar } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import Image from "next/image"

export default function StudentsPage() {
  const students = [
    {
      id: 1,
      name: "أحمد محمد",
      email: "ahmed@example.com",
      enrolledCourses: 3,
      completedCourses: 1,
      certificates: 1,
      joinDate: "15 يناير 2024",
      lastActive: "منذ ساعتين",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "فاطمة علي",
      email: "fatima@example.com",
      enrolledCourses: 5,
      completedCourses: 2,
      certificates: 2,
      joinDate: "8 ديسمبر 2023",
      lastActive: "منذ يوم",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "خالد حسن",
      email: "khalid@example.com",
      enrolledCourses: 2,
      completedCourses: 0,
      certificates: 0,
      joinDate: "22 يناير 2024",
      lastActive: "منذ 3 أيام",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "سارة أحمد",
      email: "sara@example.com",
      enrolledCourses: 4,
      completedCourses: 3,
      certificates: 3,
      joinDate: "5 نوفمبر 2023",
      lastActive: "منذ ساعة",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ]

  const totalStudents = students.length
  const totalEnrollments = students.reduce((sum, s) => sum + s.enrolledCourses, 0)
  const totalCompleted = students.reduce((sum, s) => sum + s.completedCourses, 0)
  const totalCertificates = students.reduce((sum, s) => sum + s.certificates, 0)

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="الطلاب" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          إدارة ومتابعة جميع طلابك
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={Users}
          title="إجمالي الطلاب"
          value={totalStudents}
          description="طالب نشط"
        />
        <DashboardCard
          variant="green"
          icon={UserPlus}
          title="إجمالي التسجيلات"
          value={totalEnrollments}
          description="تسجيل في الدورات"
        />
        <DashboardCard
          variant="yellow"
          icon={GraduationCap}
          title="الدورات المكتملة"
          value={totalCompleted}
          description="دورة مكتملة"
        />
        <DashboardCard
          variant="purple"
          icon={Award}
          title="الشهادات الممنوحة"
          value={totalCertificates}
          description="شهادة"
        />
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن طالب..."
          className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      {/* Students List */}
      <DashboardContentCard
        title="قائمة الطلاب"
        description={`${totalStudents} طالب نشط`}
        icon={Users}
      >
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={student.avatar}
                    alt={student.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="sm:hidden flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{student.name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-1">{student.email}</p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="hidden sm:block text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-1">{student.name}</h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1 line-clamp-1">
                    <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">{student.email}</span>
                    <span className="sm:hidden">{student.email}</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    انضم: {student.joinDate}
                  </span>
                  <span className="hidden md:inline text-gray-500">آخر نشاط: {student.lastActive}</span>
                  <div className="sm:hidden flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>{student.joinDate}</span>
                    <span className="mx-1">•</span>
                    <span>{student.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm flex-shrink-0">
                <div className="text-center">
                  <p className="font-bold text-gray-900">{student.enrolledCourses}</p>
                  <p className="text-gray-600 text-[10px] sm:text-xs">مسجل</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{student.completedCourses}</p>
                  <p className="text-gray-600 text-[10px] sm:text-xs">مكتمل</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{student.certificates}</p>
                  <p className="text-gray-600 text-[10px] sm:text-xs">شهادة</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

