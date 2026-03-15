'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardContentCard, DashboardCard } from '@/components/dashboard/DashboardCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { BookOpen, Search, Loader2, CheckCircle2, XCircle, PauseCircle } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'

type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED'

type CourseRow = {
  id: string
  title: string
  category: string
  price: number
  status: CourseStatus
  createdAt: string
  updatedAt: string
  teacher: { id: string; fullName: string | null } | null
  sectionCount: number
}

const STATUS_LABEL: Record<CourseStatus, string> = {
  DRAFT: 'مسودة',
  PENDING_REVIEW: 'قيد المراجعة',
  PUBLISHED: 'منشورة',
  ARCHIVED: 'أرشيف',
}

const STATUS_CLASS: Record<CourseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-amber-100 text-amber-700',
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar-DZ', {
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (searchDebounced) params.set('search', searchDebounced)
      const res = await fetch(`/api/admin/courses?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchDebounced])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const fetchAllForStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses', { credentials: 'include' })
      if (!res.ok) return { total: 0, pendingReview: 0, published: 0 }
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      return {
        total: list.length,
        pendingReview: list.filter((c: CourseRow) => c.status === 'PENDING_REVIEW').length,
        published: list.filter((c: CourseRow) => c.status === 'PUBLISHED').length,
      }
    } catch {
      return { total: 0, pendingReview: 0, published: 0 }
    }
  }, [])

  const [stats, setStats] = useState({ total: 0, pendingReview: 0, published: 0 })

  useEffect(() => {
    fetchAllForStats().then(setStats)
  }, [fetchAllForStats, courses])

  const handleAction = async (courseId: string, action: 'approve' | 'reject' | 'suspend') => {
    setActingId(courseId)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: updated.status } : c)))
        fetchAllForStats().then(setStats)
      }
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="الدورات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          إدارة جميع دورات المنصة والموافقة على الدورات قيد المراجعة
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={BookOpen}
          title="إجمالي الدورات"
          value={stats.total}
          description="دورة"
        />
        <DashboardCard
          variant="yellow"
          icon={BookOpen}
          title="قيد المراجعة"
          value={stats.pendingReview}
          description="بانتظار الموافقة"
        />
        <DashboardCard
          variant="green"
          icon={BookOpen}
          title="المنشورة"
          value={stats.published}
          description="دورة نشطة"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالعنوان أو المدرّس..."
            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">جميع الدورات</option>
          <option value="PENDING_REVIEW">قيد المراجعة</option>
          <option value="PUBLISHED">منشورة</option>
          <option value="DRAFT">مسودة</option>
          <option value="ARCHIVED">أرشيف</option>
        </select>
      </div>

      <DashboardContentCard
        title="قائمة الدورات"
        description={
          courses.length === 0 && !loading
            ? 'لا توجد دورات'
            : statusFilter === 'PENDING_REVIEW'
              ? 'دورات بانتظار الموافقة أو الرفض'
              : undefined
        }
        icon={BookOpen}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد دورات</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              {statusFilter ? 'لا توجد دورات بهذه الحالة.' : 'لم تُضف أي دورات بعد.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">المدرّس</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-gray-900">{course.title}</TableCell>
                  <TableCell className="text-gray-600">
                    {course.teacher?.fullName ?? '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_CLASS[course.status]}`}
                    >
                      {STATUS_LABEL[course.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{course.price.toLocaleString()} د.ج</TableCell>
                  <TableCell className="text-gray-600">{formatDate(course.createdAt)}</TableCell>
                  <TableCell>
                    {course.status === 'PENDING_REVIEW' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={actingId === course.id}
                          onClick={() => handleAction(course.id, 'approve')}
                        >
                          {actingId === course.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 ml-1" />
                              نشر
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          disabled={actingId === course.id}
                          onClick={() => handleAction(course.id, 'reject')}
                        >
                          {actingId === course.id ? null : (
                            <>
                              <XCircle className="h-4 w-4 ml-1" />
                              رفض
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    {course.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-200 text-amber-700 hover:bg-amber-50"
                        disabled={actingId === course.id}
                        onClick={() => handleAction(course.id, 'suspend')}
                      >
                        {actingId === course.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <PauseCircle className="h-4 w-4 ml-1" />
                            تعليق
                          </>
                        )}
                      </Button>
                    )}
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
