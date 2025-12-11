import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { Star, MessageSquare, TrendingUp, ThumbsUp, Search } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import Image from "next/image"

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      courseName: "مقدمة في البرمجة",
      studentName: "أحمد محمد",
      rating: 5,
      comment: "دورة رائعة ومفيدة جداً، المحتوى واضح ومنظم بشكل ممتاز. أنصح بها بشدة!",
      date: "10 يناير 2024",
      helpful: 12,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      courseName: "تصميم واجهات المستخدم",
      studentName: "فاطمة علي",
      rating: 4,
      comment: "محتوى جيد ولكن يحتاج إلى المزيد من الأمثلة العملية.",
      date: "8 يناير 2024",
      helpful: 8,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      courseName: "قواعد البيانات المتقدمة",
      studentName: "خالد حسن",
      rating: 5,
      comment: "أفضل دورة في قواعد البيانات! شرح مفصل وواضح.",
      date: "5 يناير 2024",
      helpful: 15,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      courseName: "مقدمة في البرمجة",
      studentName: "سارة أحمد",
      rating: 5,
      comment: "شكراً لك على هذه الدورة الممتازة. استفدت كثيراً منها.",
      date: "3 يناير 2024",
      helpful: 20,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ]

  const totalReviews = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length
  const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful, 0)

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="التقييمات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          مراجعة تقييمات الطلاب لدوراتك
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={MessageSquare}
          title="إجمالي التقييمات"
          value={totalReviews}
          description="تقييم إجمالي"
        />
        <DashboardCard
          variant="yellow"
          icon={Star}
          title="متوسط التقييم"
          value={avgRating.toFixed(1)}
          description={`${fiveStarReviews} تقييم 5 نجوم`}
        />
        <DashboardCard
          variant="green"
          icon={ThumbsUp}
          title="مفيد"
          value={totalHelpful}
          description="إجمالي مفيد"
        />
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="نسبة الرضا"
          value="96%"
          description="طلاب راضون"
        />
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث في التقييمات..."
          className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      {/* Reviews List */}
      <DashboardContentCard
        title="التقييمات الأخيرة"
        description={`${totalReviews} تقييم`}
        icon={Star}
      >
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={review.avatar}
                    alt={review.studentName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{review.studentName}</h3>
                      <p className="text-sm text-gray-600">{review.courseName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{review.date}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{review.helpful} مفيد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

