'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardContentCard, DashboardCard } from '@/components/dashboard/DashboardCard'
import { BookOpen, Plus, Edit, Eye, Users, TrendingUp, Search, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { GradientText } from '@/components/text/gradient-text'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

type CourseRow = {
  id: string
  title: string
  category: string
  price: number
  imageUrl: string | null
  duration: string | null
  level: string | null
  language: string | null
  description: string | null
  status: CourseStatus
  sectionCount: number
  itemCount: number
  createdAt: string
  updatedAt: string
}

const STATUS_LABEL: Record<CourseStatus, string> = {
  DRAFT: 'مسودة',
  PUBLISHED: 'منشورة',
  ARCHIVED: 'أرشيف',
}

const STATUS_CLASS: Record<CourseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-amber-100 text-amber-700',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusParam =
        filter === 'published' ? 'published' : filter === 'draft' ? 'draft' : filter === 'archived' ? 'archived' : ''
      const url = statusParam ? `/api/teacher/courses?status=${statusParam}` : '/api/teacher/courses'
      const res = await fetch(url)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        setCourses([])
        return
      }
      setCourses(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('حدث خطأ في الاتصال')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const updateStatus = async (id: string, status: CourseStatus) => {
    setOpenMenuId(null)
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/teacher/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'فشل تحديث الحالة')
        return
      }
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      )
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setUpdatingId(null)
    }
  }

  const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED')
  const draftCourses = courses.filter((c) => c.status === 'DRAFT')
  const archivedCourses = courses.filter((c) => c.status === 'ARCHIVED')
  const searchLower = search.trim().toLowerCase()
  const filteredBySearch =
    searchLower === ''
      ? courses
      : courses.filter(
          (c) =>
            c.title.toLowerCase().includes(searchLower) ||
            c.category.toLowerCase().includes(searchLower)
        )

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            <GradientText text="الدورات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-base text-gray-600">إدارة ومتابعة جميع دوراتك</p>
        </div>
        <Link
          href="/dashboard/teacher/courses/new"
          className="relative inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-xl transition-all duration-200 group/btn"
        >
          <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
          <Plus className="h-5 w-5 relative z-10" />
          <span className="relative z-10">دورة جديدة</span>
        </Link>
      </div>

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
          title="المسودات"
          value={draftCourses.length}
          description="قيد الإعداد"
        />
        <DashboardCard
          variant="yellow"
          icon={BookOpen}
          title="المنشورة"
          value={publishedCourses.length}
          description="دورة نشطة"
        />
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="الأرشيف"
          value={archivedCourses.length}
          description="دورة مؤرشفة"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            الكل ({courses.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'published' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            منشورة ({publishedCourses.length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'draft' ? 'bg-gray-200 text-gray-800 border border-gray-300' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            مسودات ({draftCourses.length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'archived' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            أرشيف ({archivedCourses.length})
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن دورة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : filteredBySearch.length === 0 ? (
        <DashboardContentCard
          title="لا توجد دورات"
          description={courses.length === 0 ? 'أنشئ دورة جديدة للبدء' : 'لا توجد نتائج للبحث'}
          icon={BookOpen}
        >
          {courses.length === 0 && (
            <Link
              href="/dashboard/teacher/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100"
            >
              <Plus className="h-4 w-4" />
              دورة جديدة
            </Link>
          )}
        </DashboardContentCard>
      ) : filter === 'all' ? (
        <>
          {filteredBySearch.filter((c) => c.status === 'PUBLISHED').length > 0 && (
            <DashboardContentCard
              title="الدورات المنشورة"
              description={`${publishedCourses.length} دورة نشطة`}
              icon={BookOpen}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBySearch
                  .filter((c) => c.status === 'PUBLISHED')
                  .map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onStatusChange={updateStatus}
                      updatingId={updatingId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  ))}
              </div>
            </DashboardContentCard>
          )}
          {filteredBySearch.filter((c) => c.status === 'DRAFT').length > 0 && (
            <DashboardContentCard
              title="المسودات"
              description={`${draftCourses.length} دورة قيد الإعداد`}
              icon={BookOpen}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBySearch
                  .filter((c) => c.status === 'DRAFT')
                  .map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onStatusChange={updateStatus}
                      updatingId={updatingId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  ))}
              </div>
            </DashboardContentCard>
          )}
          {filteredBySearch.filter((c) => c.status === 'ARCHIVED').length > 0 && (
            <DashboardContentCard
              title="الأرشيف"
              description={`${archivedCourses.length} دورة مؤرشفة`}
              icon={BookOpen}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBySearch
                  .filter((c) => c.status === 'ARCHIVED')
                  .map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onStatusChange={updateStatus}
                      updatingId={updatingId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  ))}
              </div>
            </DashboardContentCard>
          )}
        </>
      ) : (
        <DashboardContentCard
          title={STATUS_LABEL[filter === 'published' ? 'PUBLISHED' : filter === 'draft' ? 'DRAFT' : 'ARCHIVED']}
          description={`${filteredBySearch.length} دورة`}
          icon={BookOpen}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBySearch.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onStatusChange={updateStatus}
                updatingId={updatingId}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
          </div>
        </DashboardContentCard>
      )}
    </div>
  )
}

function CourseCard({
  course,
  onStatusChange,
  updatingId,
  openMenuId,
  setOpenMenuId,
}: {
  course: CourseRow
  onStatusChange: (id: string, status: CourseStatus) => Promise<void>
  updatingId: string | null
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}) {
  const imageUrl = course.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
  const isUpdating = updatingId === course.id

  return (
    <div className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col">
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={imageUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_CLASS[course.status]}`}>
              {STATUS_LABEL[course.status]}
            </span>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                disabled={isUpdating}
                aria-label="تغيير الحالة"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {openMenuId === course.id && (
                <div className="absolute left-0 top-full mt-1 z-10 w-48 py-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {course.status !== 'PUBLISHED' && (
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-right text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                      onClick={() => onStatusChange(course.id, 'PUBLISHED')}
                    >
                      نشر
                    </button>
                  )}
                  {course.status !== 'ARCHIVED' && (
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-right text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                      onClick={() => onStatusChange(course.id, 'ARCHIVED')}
                    >
                      أرشفة
                    </button>
                  )}
                  {course.status !== 'DRAFT' && (
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => onStatusChange(course.id, 'DRAFT')}
                    >
                      إرجاع لمسودة
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
          <p className="text-xs text-gray-500 mb-3">{course.category}</p>
          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div>
              <p className="text-gray-600">الأقسام</p>
              <p className="font-bold text-gray-900">{course.sectionCount}</p>
            </div>
            <div>
              <p className="text-gray-600">العناصر</p>
              <p className="font-bold text-gray-900">{course.itemCount}</p>
            </div>
            <div>
              <p className="text-gray-600">السعر</p>
              <p className="font-bold text-gray-900">{course.price} د.ج</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/teacher/courses/${course.id}/edit`}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              تعديل
            </Link>
            {course.status === 'PUBLISHED' && (
              <Link
                href={`/courses/${course.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                عرض
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
