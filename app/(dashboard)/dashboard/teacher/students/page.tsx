import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { Users, UserPlus, GraduationCap, Award, Search, Mail, Calendar } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function formatDateAr(date: Date) {
  return date.toLocaleDateString("ar-DZ", { day: "numeric", month: "long", year: "numeric" })
}

function formatRelativeAr(date: Date) {
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "منذ أقل من ساعة"
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  const diffDays = Math.floor(diffHours / 24)
  return `منذ ${diffDays} يوم`
}

export default async function StudentsPage() {
  const session = await getUserSession()
  if (!session || session.role !== "TEACHER") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للمدرسين فقط</p>
      </div>
    )
  }

  const orders = await prisma.order.findMany({
    where: { status: "CONFIRMED", course: { teacherId: session.userId } },
    select: {
      userId: true,
      courseId: true,
      user: { select: { fullName: true, email: true, createdAt: true } },
      course: { select: { id: true, title: true } },
    },
  })

  const studentIds = Array.from(new Set(orders.map((o) => o.userId)))
  const courseIds = Array.from(new Set(orders.map((o) => o.courseId)))

  const [itemsByCourse, progressRows] = await Promise.all([
    prisma.courseSection.findMany({
      where: { courseId: { in: courseIds } },
      select: { courseId: true, items: { select: { id: true } } },
    }),
    prisma.courseItemProgress.findMany({
      where: { userId: { in: studentIds }, courseId: { in: courseIds }, completedAt: { not: null } },
      select: { userId: true, courseId: true, itemId: true, lastViewedAt: true, updatedAt: true },
    }),
  ])

  const totalItemsByCourse = new Map<string, number>()
  for (const s of itemsByCourse) {
    totalItemsByCourse.set(s.courseId, (totalItemsByCourse.get(s.courseId) ?? 0) + s.items.length)
  }

  const studentCourses = new Map<string, Set<string>>()
  const courseTitleById = new Map<string, string>()
  for (const o of orders) {
    const set = studentCourses.get(o.userId) ?? new Set<string>()
    set.add(o.courseId)
    studentCourses.set(o.userId, set)
    courseTitleById.set(o.courseId, o.course?.title ?? "دورة")
  }

  const completedByStudentCourse = new Map<string, Set<string>>()
  const lastActivityByStudent = new Map<string, Date>()
  for (const row of progressRows) {
    const key = `${row.userId}:${row.courseId}`
    const set = completedByStudentCourse.get(key) ?? new Set<string>()
    set.add(row.itemId)
    completedByStudentCourse.set(key, set)

    const t = row.lastViewedAt ?? row.updatedAt
    const prev = lastActivityByStudent.get(row.userId)
    if (!prev || t > prev) lastActivityByStudent.set(row.userId, t)
  }

  const userMap = new Map<string, { name: string; email: string; createdAt: Date }>()
  for (const o of orders) {
    if (!userMap.has(o.userId)) {
      userMap.set(o.userId, {
        name: o.user?.fullName ?? "طالب",
        email: o.user?.email ?? "—",
        createdAt: o.user?.createdAt ?? new Date(),
      })
    }
  }

  const students = studentIds.map((id) => {
    const courses = Array.from(studentCourses.get(id) ?? new Set<string>())
    let completedCourses = 0
    for (const courseId of courses) {
      const total = totalItemsByCourse.get(courseId) ?? 0
      const completed = (completedByStudentCourse.get(`${id}:${courseId}`) ?? new Set<string>()).size
      if (total > 0 && completed === total) completedCourses += 1
    }
    return {
      id,
      name: userMap.get(id)?.name ?? "طالب",
      email: userMap.get(id)?.email ?? "—",
      enrolledCourses: courses.length,
      completedCourses,
      certificates: 0,
      joinDate: formatDateAr(userMap.get(id)?.createdAt ?? new Date()),
      lastActive: lastActivityByStudent.get(id) ? formatRelativeAr(lastActivityByStudent.get(id) as Date) : "لا نشاط بعد",
      courses: courses.map((courseId) => {
        const total = totalItemsByCourse.get(courseId) ?? 0
        const completed = (completedByStudentCourse.get(`${id}:${courseId}`) ?? new Set<string>()).size
        const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
        return {
          id: courseId,
          title: courseTitleById.get(courseId) ?? "دورة",
          totalItems: total,
          completedItems: completed,
          progressPct,
        }
      }),
    }
  })

  const totalStudents = students.length
  const totalEnrollments = students.reduce((sum, s) => sum + s.enrolledCourses, 0)
  const totalCompleted = students.reduce((sum, s) => sum + s.completedCourses, 0)
  const totalCertificates = 0

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
            <details key={student.id} className="border border-gray-200 rounded-xl overflow-hidden group open:shadow-md transition-all duration-300">
              <summary className="list-none cursor-pointer p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 bg-amber-100 text-amber-700 flex items-center justify-center font-semibold">
                      {(student.name || "ط")[0]}
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
                  </div>
                </div>
              </summary>
              <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">الدورات المسجل فيها:</p>
                <div className="space-y-2">
                  {student.courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-600">
                          {course.completedItems}/{course.totalItems} دروس
                        </p>
                      </div>
                      <div className="mt-2 w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600" style={{ width: `${course.progressPct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

