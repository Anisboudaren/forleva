'use client'

import { useState, useEffect, useMemo } from "react"
import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { Star, MessageSquare, TrendingUp, ThumbsUp, Search, Trash2 } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Review = {
  id: string
  courseId: string
  courseName: string
  studentName: string
  studentId: string
  rating: number
  comment: string | null
  createdAt: string
  deletionRequestedAt: string | null
  deletionRequestedBy: string | null
}

type TeacherReviewsResponse = {
  reviews: Review[]
  stats: {
    totalReviews: number
    avgRating: number
    fiveStarCount: number
    satisfactionPercent: number
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<TeacherReviewsResponse["stats"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [requestDeletionId, setRequestDeletionId] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [confirmDeletionReviewId, setConfirmDeletionReviewId] = useState<string | null>(null)

  const fetchReviews = () => {
    fetch("/api/teacher/reviews", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TeacherReviewsResponse | null) => {
        if (data) {
          setReviews(data.reviews ?? [])
          setStats(data.stats ?? null)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch("/api/teacher/reviews", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("فشل تحميل التقييمات")
        return res.json() as Promise<TeacherReviewsResponse>
      })
      .then((data) => {
        if (!cancelled) {
          setReviews(data.reviews ?? [])
          setStats(data.stats ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleRequestDeletion = (reviewId: string) => {
    setConfirmDeletionReviewId(null)
    setRequestError(null)
    setRequestDeletionId(reviewId)
    fetch(`/api/teacher/reviews/${reviewId}/request-deletion`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d?.error || "فشل طلب الحذف") })
        return res.json()
      })
      .then(() => fetchReviews())
      .catch((err) => setRequestError(err?.message ?? "حدث خطأ"))
      .finally(() => setRequestDeletionId(null))
  }

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews
    const q = search.trim().toLowerCase()
    return reviews.filter(
      (r) =>
        r.courseName.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        (r.comment && r.comment.toLowerCase().includes(q))
    )
  }, [reviews, search])

  const totalReviews = stats?.totalReviews ?? reviews.length
  const avgRating = stats?.avgRating ?? (reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0)
  const fiveStarReviews = stats?.fiveStarCount ?? reviews.filter((r) => r.rating === 5).length
  const satisfactionPercent = stats?.satisfactionPercent ?? (reviews.length > 0 ? Math.round((fiveStarReviews / reviews.length) * 100) : 0)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="التقييمات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          مراجعة تقييمات الطلاب لدوراتك
        </p>
      </div>

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
          value={0}
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

      <div className="relative w-full sm:w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث في التقييمات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <DashboardContentCard
        title="التقييمات الأخيرة"
        description={`${filteredReviews.length} تقييم`}
        icon={Star}
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col max-w-xl mx-auto py-8 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد تقييمات بعد</h3>
              <p className="text-sm text-gray-600">ستظهر هنا تقييمات الطلاب لدوراتك عند إضافتهم من صفحة الدورة.</p>
            </div>
          ) : (
            <>
              {requestError && (
                <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm mb-4">
                  {requestError}
                </div>
              )}
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-lg font-bold text-amber-700">
                      {(review.studentName || "م").charAt(0)}
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
                      {review.deletionRequestedAt ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium mb-2">
                          قيد مراجعة الحذف
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletionReviewId(review.id)}
                          disabled={requestDeletionId === review.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 mb-2"
                        >
                          {requestDeletionId === review.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          طلب حذف التقييم
                        </button>
                      )}
                      {review.comment && (
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("ar-DZ", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </DashboardContentCard>

      <Dialog
        open={!!confirmDeletionReviewId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeletionReviewId(null)
        }}
      >
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>طلب حذف التقييم</DialogTitle>
            <DialogDescription>
              هل تريد طلب حذف هذا التقييم؟ سيتم مراجعته من الإدارة قبل الحذف النهائي.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeletionReviewId(null)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={() => confirmDeletionReviewId && handleRequestDeletion(confirmDeletionReviewId)}
              disabled={!!requestDeletionId}
            >
              {requestDeletionId === confirmDeletionReviewId ? (
                <>
                  جاري الإرسال...
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                </>
              ) : (
                "طلب الحذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
