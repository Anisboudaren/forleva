import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Clock, Play, CheckCircle2, Search } from "lucide-react"
import { SafeCourseImage } from "@/components/safe-course-image"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"
import { formatRelativeAr } from "@/lib/format-date"
import type { OrderStatus } from "@/lib/schema-enums"

type OrderWithCourse = {
  id: string
  status: OrderStatus
  createdAt: Date
  course: {
    id: string
    title: string
    category: string
    imageUrl: string | null
    teacher: { fullName: string | null } | null
  }
}

type MyCourse = {
  id: string
  name: string
  instructor: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastAccessed: string
  startedAtLabel: string
  image: string
  status: "in-progress" | "completed" | "not-started"
  category: string
  orderStatus: OrderStatus
}

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? "").trim().toLowerCase()
  const tab = (params.tab ?? "all").trim()
  const session = await getUserSession()

  if (!session || session.role !== "STUDENT") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للطلاب فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب طالب لعرض دوراتك.</p>
      </div>
    )
  }

  const orders: OrderWithCourse[] = await prisma.order.findMany({
    where: {
      userId: session.userId,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
    include: {
      course: {
        include: { teacher: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const confirmedCourseIds = Array.from(
    new Set(orders.filter((o) => o.status === "CONFIRMED").map((o) => o.course.id))
  )

  const [totalItemsCounts, progressRows] = await Promise.all([
    prisma.courseSectionItem.groupBy({
      by: ["sectionId"],
      where: { section: { courseId: { in: confirmedCourseIds } } },
      _count: { _all: true },
    }),
    prisma.courseItemProgress.findMany({
      where: { userId: session.userId, courseId: { in: confirmedCourseIds } },
      select: {
        courseId: true,
        itemId: true,
        startedAt: true,
        lastViewedAt: true,
        completedAt: true,
        updatedAt: true,
      },
    }),
  ])

  const sections = await prisma.courseSection.findMany({
    where: { courseId: { in: confirmedCourseIds } },
    select: { id: true, courseId: true },
  })
  const sectionToCourse = new Map(sections.map((s) => [s.id, s.courseId]))

  const totalByCourse = new Map<string, number>()
  for (const row of totalItemsCounts) {
    const cid = sectionToCourse.get(row.sectionId)
    if (!cid) continue
    totalByCourse.set(cid, (totalByCourse.get(cid) ?? 0) + row._count._all)
  }

  const completedByCourse = new Map<string, Set<string>>()
  const lastActivityByCourse = new Map<string, Date>()
  const startedAtByCourse = new Map<string, Date>()

  for (const p of progressRows) {
    const activity = p.lastViewedAt ?? p.completedAt ?? p.updatedAt
    const prev = lastActivityByCourse.get(p.courseId)
    if (!prev || activity.getTime() > prev.getTime()) lastActivityByCourse.set(p.courseId, activity)

    const started = p.startedAt ?? p.lastViewedAt ?? p.completedAt ?? p.updatedAt
    const prevStart = startedAtByCourse.get(p.courseId)
    if (!prevStart || started.getTime() < prevStart.getTime()) startedAtByCourse.set(p.courseId, started)

    if (p.completedAt) {
      const set = completedByCourse.get(p.courseId) ?? new Set<string>()
      set.add(p.itemId)
      completedByCourse.set(p.courseId, set)
    }
  }

  const courses: MyCourse[] = orders
    .filter((order) => order.course)
    .map((order) => {
      const course = order.course
      const instructorName = course.teacher?.fullName || "مدرب الدورة"
      const isConfirmed = order.status === "CONFIRMED"

      const totalLessons = isConfirmed ? (totalByCourse.get(course.id) ?? 0) : 0
      const completedLessons = isConfirmed ? (completedByCourse.get(course.id)?.size ?? 0) : 0
      const progress =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      const startedAt = isConfirmed ? (startedAtByCourse.get(course.id) ?? null) : null
      const lastAt = isConfirmed ? (lastActivityByCourse.get(course.id) ?? null) : null

      const status: MyCourse["status"] =
        totalLessons > 0 && completedLessons === totalLessons
          ? "completed"
          : completedLessons > 0
            ? "in-progress"
            : "not-started"

      return {
        id: course.id,
        name: course.title,
        instructor: instructorName,
        progress,
        totalLessons,
        completedLessons,
        lastAccessed: lastAt ? formatRelativeAr(lastAt) : "لم تبدأ بعد",
        startedAtLabel: startedAt ? formatRelativeAr(startedAt) : "لم تبدأ بعد",
        image:
          course.imageUrl ||
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        status,
        category: course.category,
        orderStatus: order.status,
      }
    })

  const filteredCourses = courses.filter((c) => {
    if (!query) return true
    return (
      c.name.toLowerCase().includes(query) ||
      c.instructor.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    )
  })

  const inProgressCourses = filteredCourses.filter((c) => c.status === "in-progress")
  const completedCourses = filteredCourses.filter((c) => c.status === "completed")
  const notStartedCourses = filteredCourses.filter((c) => c.status === "not-started")
  const showInProgress = tab === "all" || tab === "in-progress"
  const showCompleted = tab === "all" || tab === "completed"
  const showNotStarted = tab === "all" || tab === "not-started"

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="دوراتي" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          إدارة ومتابعة جميع دوراتك المسجلة
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Link href={`/dashboard/student/my-courses?tab=all${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${tab === "all" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"}`}>
            الكل ({filteredCourses.length})
          </Link>
          <Link href={`/dashboard/student/my-courses?tab=in-progress${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${tab === "in-progress" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"}`}>
            قيد التنفيذ ({inProgressCourses.length})
          </Link>
          <Link href={`/dashboard/student/my-courses?tab=completed${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${tab === "completed" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"}`}>
            مكتملة ({completedCourses.length})
          </Link>
        </div>
        <form className="relative w-full sm:w-auto" method="get">
          <input type="hidden" name="tab" value={tab} />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="ابحث عن دورة..."
            className="w-full sm:w-64 pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </form>
      </div>

      {/* In Progress Courses */}
      {showInProgress && inProgressCourses.length > 0 && (
        <DashboardContentCard
          title="قيد التنفيذ"
          description={`${inProgressCourses.length} دورة قيد التعلم`}
          icon={Play}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/student/learning/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <SafeCourseImage
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">التقدم</span>
                        <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.completedLessons}/{course.totalLessons} دروس
                      </span>
                      <span>آخر نشاط: {course.lastAccessed}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      بدأت: {course.startedAtLabel}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Completed Courses */}
      {showCompleted && completedCourses.length > 0 && (
        <DashboardContentCard
          title="مكتملة"
          description={`${completedCourses.length} دورة مكتملة`}
          icon={CheckCircle2}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/student/learning/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <SafeCourseImage
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                      <div className="bg-green-500 text-white rounded-full p-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">التقدم</span>
                        <span className="text-sm font-bold text-green-600">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full w-full" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {course.totalLessons} درس مكتمل
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      بدأت: {course.startedAtLabel}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Not Started Courses */}
      {showNotStarted && notStartedCourses.length > 0 && (
        <DashboardContentCard
          title="لم تبدأ بعد"
          description={`${notStartedCourses.length} دورة جاهزة للبدء`}
          icon={BookOpen}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notStartedCourses.map((course) => (
              <Link
                key={course.id}
                href={course.orderStatus === "PENDING" ? "#" : `/dashboard/student/learning/${course.id}`}
                aria-disabled={course.orderStatus === "PENDING"}
                className={`group relative overflow-hidden border border-gray-200 rounded-xl transition-all duration-300 ${
                  course.orderStatus === "PENDING"
                    ? "cursor-default opacity-70"
                    : "hover:shadow-lg"
                }`}
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <SafeCourseImage
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">التقدم</span>
                        <span className="text-sm font-bold text-gray-400">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full w-0" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.totalLessons > 0 ? `${course.totalLessons} درس` : "دورة جاهزة"}
                      </span>
                      <span
                        className={
                          course.orderStatus === "PENDING"
                            ? "text-gray-500 font-medium"
                            : "text-yellow-600 font-medium"
                        }
                      >
                        {course.orderStatus === "PENDING" ? "بانتظار تأكيد الطلب" : "ابدأ الآن"}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      بدأت: {course.startedAtLabel}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}
    </div>
  )
}

