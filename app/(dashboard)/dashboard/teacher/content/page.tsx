import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { FileText, Video, Image as ImageIcon, File, Plus, Edit, Trash2, Eye } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"

export default function ContentPage() {
  const content = [
    {
      id: 1,
      title: "مقدمة في البرمجة - الدرس 1",
      type: "video",
      course: "مقدمة في البرمجة",
      duration: "15:30",
      size: "125 MB",
      status: "published",
      views: 1247,
      uploadDate: "10 يناير 2024",
    },
    {
      id: 2,
      title: "ملخص الدرس الأول",
      type: "document",
      course: "مقدمة في البرمجة",
      duration: "-",
      size: "2.5 MB",
      status: "published",
      views: 892,
      uploadDate: "10 يناير 2024",
    },
    {
      id: 3,
      title: "صورة توضيحية - المتغيرات",
      type: "image",
      course: "مقدمة في البرمجة",
      duration: "-",
      size: "850 KB",
      status: "published",
      views: 567,
      uploadDate: "9 يناير 2024",
    },
    {
      id: 4,
      title: "تصميم واجهات المستخدم - الدرس 1",
      type: "video",
      course: "تصميم واجهات المستخدم",
      duration: "22:15",
      size: "180 MB",
      status: "draft",
      views: 0,
      uploadDate: "8 يناير 2024",
    },
  ]

  const publishedContent = content.filter(c => c.status === "published")
  const draftContent = content.filter(c => c.status === "draft")
  const totalViews = content.reduce((sum, c) => sum + c.views, 0)
  const totalSize = content.length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "document":
        return FileText
      case "image":
        return ImageIcon
      default:
        return File
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-600"
      case "document":
        return "bg-blue-100 text-blue-600"
      case "image":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            <GradientText text="المحتوى" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            إدارة محتوى دوراتك وملفاتك
          </p>
        </div>
        <Link
          href="/dashboard/teacher/content/upload"
          className="relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white rounded-xl transition-all duration-200 group/btn w-full sm:w-auto"
        >
          <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
          <span className="relative z-10">رفع محتوى</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={FileText}
          title="إجمالي المحتوى"
          value={content.length}
          description={`${publishedContent.length} منشور`}
        />
        <DashboardCard
          variant="green"
          icon={Video}
          title="الفيديوهات"
          value={content.filter(c => c.type === "video").length}
          description="فيديو"
        />
        <DashboardCard
          variant="yellow"
          icon={Eye}
          title="إجمالي المشاهدات"
          value={totalViews.toLocaleString()}
          description="مشاهدة"
        />
        <DashboardCard
          variant="purple"
          icon={File}
          title="المسودات"
          value={draftContent.length}
          description="محتوى قيد المراجعة"
        />
      </div>

      {/* Content List */}
      <DashboardContentCard
        title="قائمة المحتوى"
        description={`${content.length} ملف`}
        icon={FileText}
      >
        <div className="space-y-4">
          {content.map((item) => {
            const TypeIcon = getTypeIcon(item.type)
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div className={`p-3 rounded-lg ${getTypeColor(item.type)} flex-shrink-0 w-fit`}>
                  <TypeIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="line-clamp-1">{item.course}</span>
                    {item.duration !== "-" && <span className="hidden sm:inline">المدة: {item.duration}</span>}
                    <span className="hidden md:inline">الحجم: {item.size}</span>
                    <span className="hidden lg:inline">المشاهدات: {item.views}</span>
                    <div className="flex sm:hidden items-center gap-2 text-xs">
                      <span>الحجم: {item.size}</span>
                      <span>•</span>
                      <span>{item.views} مشاهدة</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === "published" ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                      منشور
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                      مسودة
                    </span>
                  )}
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" aria-label="تعديل">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </DashboardContentCard>
    </div>
  )
}

