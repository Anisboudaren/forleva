'use client'

import { useEffect, useState, useMemo } from 'react'
import { DashboardContentCard } from '@/components/dashboard/DashboardCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Star, Search, Loader2, Check, X } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'

type ReviewRow = {
  id: string
  courseId: string
  courseName: string
  teacherId: string | undefined
  teacherName: string
  userId: string
  userName: string
  userEmail: string | undefined
  rating: number
  comment: string | null
  createdAt: string
}

type PendingReviewRow = ReviewRow & {
  deletionRequestedAt: string
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [decisionId, setDecisionId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('')

  const fetchReviews = () => {
    fetch('/api/admin/reviews', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
  }

  const fetchPending = () => {
    fetch('/api/admin/reviews/pending-deletion', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setPendingReviews(data.reviews ?? []))
      .catch(() => setPendingReviews([]))
      .finally(() => setPendingLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/admin/reviews', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('فشل تحميل التقييمات')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setReviews(data.reviews ?? [])
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    fetchPending()
  }, [])

  const handleDeletionDecision = (reviewId: string, action: 'approve' | 'reject') => {
    setDecisionId(reviewId)
    fetch(`/api/admin/reviews/${reviewId}/deletion-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('فشل تنفيذ العملية')
        return res.json()
      })
      .then(() => {
        setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId))
        if (action === 'reject') fetchReviews()
      })
      .catch(() => {})
      .finally(() => setDecisionId(null))
  }

  const filteredReviews = useMemo(() => {
    let list = reviews
    if (ratingFilter) {
      const r = Number(ratingFilter)
      if (r >= 1 && r <= 5) list = list.filter((rev) => rev.rating === r)
    }
    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase()
      list = list.filter(
        (rev) =>
          rev.courseName.toLowerCase().includes(q) ||
          rev.teacherName.toLowerCase().includes(q) ||
          rev.userName.toLowerCase().includes(q) ||
          (rev.userEmail && rev.userEmail.toLowerCase().includes(q)) ||
          (rev.comment && rev.comment.toLowerCase().includes(q))
      )
    }
    return list
  }, [reviews, searchInput, ratingFilter])

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText
            text="التقييمات"
            gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
          />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          عرض جميع تقييمات الدورات من المتعلمين
        </p>
      </div>

      {pendingLoading ? null : pendingReviews.length > 0 ? (
        <DashboardContentCard
          title="تقييمات مطلوب حذفها"
          description="مراجعة طلبات الحذف من المدرّسين — قبول أو رفض"
          icon={Star}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الدورة</TableHead>
                <TableHead className="text-right">المدرّس</TableHead>
                <TableHead className="text-right">المُقيّم</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">التعليق</TableHead>
                <TableHead className="text-right">تاريخ الطلب</TableHead>
                <TableHead className="text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReviews.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell className="font-medium text-gray-900">{rev.courseName}</TableCell>
                  <TableCell className="text-gray-600">{rev.teacherName}</TableCell>
                  <TableCell className="text-gray-600">
                    {rev.userName}
                    {rev.userEmail && (
                      <span className="text-xs text-gray-400 block" dir="ltr">
                        {rev.userEmail}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5" dir="ltr">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= rev.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {rev.comment || '—'}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatDate(rev.deletionRequestedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletionDecision(rev.id, 'approve')}
                        disabled={decisionId === rev.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                      >
                        {decisionId === rev.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        قبول الحذف
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletionDecision(rev.id, 'reject')}
                        disabled={decisionId === rev.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        رفض الحذف
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardContentCard>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالدورة أو المدرّس أو المُقيّم..."
            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">كل التقييمات</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={String(r)}>
              {r} نجوم
            </option>
          ))}
        </select>
      </div>

      <DashboardContentCard
        title="قائمة التقييمات"
        description={
          filteredReviews.length === 0 && !loading
            ? 'لا توجد تقييمات حتى الآن'
            : undefined
        }
        icon={Star}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد تقييمات</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              ستظهر هنا تقييمات الطلاب للدورات عندما يضيفونها من صفحة كل دورة بعد تسجيل الدخول.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الدورة</TableHead>
                <TableHead className="text-right">المدرّس</TableHead>
                <TableHead className="text-right">المُقيّم</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">التعليق</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell className="font-medium text-gray-900">
                    {rev.courseName}
                  </TableCell>
                  <TableCell className="text-gray-600">{rev.teacherName}</TableCell>
                  <TableCell className="text-gray-600">
                    {rev.userName}
                    {rev.userEmail && (
                      <span className="text-xs text-gray-400 block" dir="ltr">
                        {rev.userEmail}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5" dir="ltr">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= rev.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {rev.comment || '—'}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatDate(rev.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardContentCard>
    </div>
  )
}
