import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Plus, Edit, Eye, Users, Star, TrendingUp, Search, Filter } from "lucide-react"
import Image from "next/image"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      name: "مقدمة في البرمجة",
      students: 342,
      sales: 1247,
      rating: 4.9,
      reviews: 156,
      price: 299,
      status: "published",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      category: "برمجة",
      lastUpdated: "منذ يومين",
    },
    {
      id: 2,
      name: "تصميم واجهات المستخدم",
      students: 189,
      sales: 892,
      rating: 4.7,
      reviews: 98,
      price: 249,
      status: "published",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
      category: "تصميم",
      lastUpdated: "منذ أسبوع",
    },
    {
      id: 3,
      name: "React للمحترفين",
      students: 0,
      sales: 0,
      rating: 0,
      reviews: 0,
      price: 399,
      status: "draft",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      category: "برمجة",
      lastUpdated: "منذ 3 أيام",
    },
    {
      id: 4,
      name: "قواعد البيانات المتقدمة",
      students: 256,
      sales: 1103,
      rating: 4.8,
      reviews: 134,
      price: 349,
      status: "published",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
      category: "برمجة",
      lastUpdated: "منذ 5 أيام",
    },
  ]

  const publishedCourses = courses.filter(c => c.status === "published")
  const draftCourses = courses.filter(c => c.status === "draft")
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0)
  const totalSales = courses.reduce((sum, c) => sum + c.sales, 0)
  const avgRating = courses.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / publishedCourses.length || 0

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            <GradientText text="الدورات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-base text-gray-600">
            إدارة ومتابعة جميع دوراتك
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="relative inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-xl transition-all duration-200 group/btn"
        >
          <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
          <Plus className="h-5 w-5 relative z-10" />
          <span className="relative z-10">دورة جديدة</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={BookOpen}
          title="إجمالي الدورات"
          value={courses.length}
          description={`${publishedCourses.length} منشورة`}
        />
        <DashboardCard
          variant="green"
          icon={Users}
          title="إجمالي الطلاب"
          value={totalStudents.toLocaleString()}
          description={`${totalSales.toLocaleString()} مبيعة`}
        />
        <DashboardCard
          variant="yellow"
          icon={Star}
          title="متوسط التقييم"
          value={avgRating.toFixed(1)}
          description={`${publishedCourses.reduce((sum, c) => sum + c.reviews, 0)} تقييم`}
        />
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="إجمالي المبيعات"
          value={totalSales.toLocaleString()}
          description="مبيعة إجمالية"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            الكل ({courses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            منشورة ({publishedCourses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            مسودات ({draftCourses.length})
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

      {/* Published Courses */}
      {publishedCourses.length > 0 && (
        <DashboardContentCard
          title="الدورات المنشورة"
          description={`${publishedCourses.length} دورة نشطة`}
          icon={BookOpen}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publishedCourses.map((course) => (
              <div
                key={course.id}
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
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        منشورة
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">{course.category}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div>
                        <p className="text-gray-600">الطلاب</p>
                        <p className="font-bold text-gray-900">{course.students}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">المبيعات</p>
                        <p className="font-bold text-gray-900">{course.sales}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">التقييم</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <p className="font-bold text-gray-900">{course.rating}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">السعر</p>
                        <p className="font-bold text-gray-900">{course.price} ر.س</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/courses/${course.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Link>
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Draft Courses */}
      {draftCourses.length > 0 && (
        <DashboardContentCard
          title="المسودات"
          description={`${draftCourses.length} دورة قيد الإعداد`}
          icon={BookOpen}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {draftCourses.map((course) => (
              <div
                key={course.id}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-75"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        مسودة
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">{course.category}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">السعر</p>
                      <p className="text-sm font-bold text-gray-900">{course.price} ر.س</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/courses/${course.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        إكمال
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardContentCard>
      )}
    </div>
  )
}

