'use client'

import { useState } from "react"
import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { Star, MessageSquare, TrendingUp, ThumbsUp, Search } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type Review = {
  id: number
  courseName: string
  studentName: string
  rating: number
  comment: string
  date: string
  helpful: number
  avatar: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalReviews = reviews.length
  const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length
  const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful, 0)
  const satisfactionPercent = totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 0

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
          value={totalReviews > 0 ? avgRating.toFixed(1) : "—"}
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
          value={totalReviews > 0 ? `${satisfactionPercent}%` : "—"}
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
          {reviews.length === 0 ? (
            <div className="flex flex-col max-w-xl mx-auto py-8 px-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد تقييمات بعد</h3>
                <p className="text-sm text-gray-600">أضف تقييماً أو تعليقاً</p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (rating === 0 || !comment.trim()) return
                  setIsSubmitting(true)
                  setReviews((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      courseName: "دورة",
                      studentName: "تقييم جديد",
                      rating,
                      comment: comment.trim(),
                      date: new Date().toLocaleDateString("ar-DZ", { day: "numeric", month: "long", year: "numeric" }),
                      helpful: 0,
                      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
                    },
                  ])
                  setRating(0)
                  setHoverRating(0)
                  setComment("")
                  setIsSubmitting(false)
                }}
                className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التقييم (نجوم)</label>
                  <div className="flex gap-1" dir="ltr">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                        aria-label={`${value} نجوم`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            value <= (hoverRating || rating)
                              ? "fill-amber-500 text-amber-500"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                    التعليق أو المراجعة
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="اكتب تعليقك أو مراجعتك هنا..."
                    rows={4}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y min-h-[100px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={rating === 0 || !comment.trim() || isSubmitting}
                  className="w-full rounded-full font-semibold"
                  style={{ background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" }}
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
                </Button>
              </form>
            </div>
          ) : (
          reviews.map((review) => (
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
          )))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

