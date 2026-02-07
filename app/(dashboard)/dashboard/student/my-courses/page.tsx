import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Clock, Play, CheckCircle2, Search } from "lucide-react"
import Image from "next/image"
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
  image: string
  status: "in-progress" | "completed" | "not-started"
  category: string
  orderStatus: OrderStatus
}

export default async function MyCoursesPage() {
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
        include: {
          teacher: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const courses: MyCourse[] = orders
    .filter((order) => order.course)
    .map((order) => {
      const course = order.course
      const instructorName = course.teacher?.fullName || "مدرب الدورة"

      return {
        id: course.id,
        name: course.title,
        instructor: instructorName,
        // TODO: استبدال القيم الثابتة بتقدم فعلي عندما يتوفر
        progress: 0,
        totalLessons: 0,
        completedLessons: 0,
        lastAccessed: formatRelativeAr(order.createdAt),
        image:
          course.imageUrl ||
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        // حالياً جميع الدورات تعتبر "لم تبدأ بعد" حتى يتم بناء نظام التقدم
        status: "not-started",
        category: course.category,
        orderStatus: order.status,
      }
    })

  const inProgressCourses = courses.filter((c) => c.status === "in-progress")
  const completedCourses = courses.filter((c) => c.status === "completed")
  const notStartedCourses = courses.filter((c) => c.status === "not-started")

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
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            الكل ({courses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            قيد التنفيذ ({inProgressCourses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            مكتملة ({completedCourses.length})
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن دورة..."
            className="w-full sm:w-64 pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <DashboardContentCard
          title="قيد التنفيذ"
          description={`${inProgressCourses.length} دورة قيد التعلم`}
          icon={Play}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
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
                      <span>{course.lastAccessed}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <DashboardContentCard
          title="مكتملة"
          description={`${completedCourses.length} دورة مكتملة`}
          icon={CheckCircle2}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Not Started Courses */}
      {notStartedCourses.length > 0 && (
        <DashboardContentCard
          title="لم تبدأ بعد"
          description={`${notStartedCourses.length} دورة جاهزة للبدء`}
          icon={BookOpen}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notStartedCourses.map((course) => (
              <Link
                key={course.id}
                href={course.orderStatus === "PENDING" ? "#" : `/courses/${course.id}`}
                aria-disabled={course.orderStatus === "PENDING"}
                className={`group relative overflow-hidden border border-gray-200 rounded-xl transition-all duration-300 ${
                  course.orderStatus === "PENDING"
                    ? "cursor-default opacity-70"
                    : "hover:shadow-lg"
                }`}
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
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

