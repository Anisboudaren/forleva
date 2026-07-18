'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TablePagination } from '@/components/ui/table-pagination'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Layers,
  Search,
  Loader2,
  Plus,
  Pencil,
  PauseCircle,
  PlayCircle,
  ImagePlus,
} from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'
import { runImageUpload, ImageUploadError } from '@/lib/image-upload-client'
import { PLACEHOLDER_COURSE_IMAGE } from '@/lib/safe-course-image'

type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  imageKey: string | null
  isActive: boolean
  sortOrder: number
  courseCount: number
  createdAt: string
  updatedAt: string
}

type CategoryForm = {
  name: string
  description: string
  imageUrl: string
  imageKey: string
  isActive: boolean
}

const emptyForm = (): CategoryForm => ({
  name: '',
  description: '',
  imageUrl: '',
  imageKey: '',
  isActive: true,
})

const PAGE_SIZE = 10

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filtered = categories.filter((c) => {
    if (!searchDebounced.trim()) return true
    const q = searchDebounced.trim().toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(() => {
    setPage(1)
  }, [searchDebounced])
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    courses: categories.reduce((sum, c) => sum + c.courseCount, 0),
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setDialogOpen(true)
  }

  const openEdit = (row: CategoryRow) => {
    setEditing(row)
    setForm({
      name: row.name,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? '',
      imageKey: row.imageKey ?? '',
      isActive: row.isActive,
    })
    setError(null)
    setDialogOpen(true)
  }

  const handleImagePick = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const result = await runImageUpload(file, {
        prefix: 'categories',
        name: file.name,
      })
      setForm((prev) => ({
        ...prev,
        imageUrl: result.url,
        imageKey: result.key,
      }))
    } catch (err) {
      const message =
        err instanceof ImageUploadError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'فشل رفع الصورة'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('اسم الفئة مطلوب')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        imageKey: form.imageKey.trim() || null,
        isActive: form.isActive,
      }
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories',
        {
          method: editing ? 'PATCH' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'فشل الحفظ')
        return
      }
      setDialogOpen(false)
      await fetchCategories()
    } catch {
      setError('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (row: CategoryRow) => {
    setActingId(row.id)
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !row.isActive }),
      })
      if (res.ok) await fetchCategories()
    } finally {
      setActingId(null)
    }
  }

  const previewSrc = form.imageUrl.trim() || PLACEHOLDER_COURSE_IMAGE

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            <GradientText
              text="الفئات"
              gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
            />
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            إدارة فئات الدورات وصورها المستخدمة في المنصة
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة فئة
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          variant="blue"
          icon={Layers}
          title="إجمالي الفئات"
          value={stats.total}
          description="فئة"
        />
        <DashboardCard
          variant="green"
          icon={Layers}
          title="الفئات النشطة"
          value={stats.active}
          description="ظاهرة للمعلمين والزوار"
        />
        <DashboardCard
          variant="yellow"
          icon={Layers}
          title="الدورات المرتبطة"
          value={stats.courses}
          description="دورة"
        />
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث باسم الفئة..."
          className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <DashboardContentCard
        title="قائمة الفئات"
        description={filtered.length === 0 && !loading ? 'لا توجد فئات' : undefined}
        icon={Layers}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصورة</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الدورات</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="relative h-12 w-16 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                      <Image
                        src={row.imageUrl || PLACEHOLDER_COURSE_IMAGE}
                        alt={row.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{row.name}</TableCell>
                  <TableCell className="max-w-xs text-gray-600 truncate">
                    {row.description || '—'}
                  </TableCell>
                  <TableCell className="text-gray-700">{row.courseCount}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {row.isActive ? 'نشطة' : 'معطّلة'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={actingId === row.id}
                        onClick={() => toggleActive(row)}
                      >
                        {actingId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : row.isActive ? (
                          <PauseCircle className="h-4 w-4" />
                        ) : (
                          <PlayCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </DashboardContentCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="category-name" className="mb-2 block">
                اسم الفئة
              </Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: برمجة"
              />
            </div>

            <div>
              <Label htmlFor="category-description" className="mb-2 block">
                الوصف
              </Label>
              <textarea
                id="category-description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="وصف قصير يظهر في صفحة الفئات"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <Label className="mb-2 block">صورة الفئة</Label>
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <Image
                    src={previewSrc}
                    alt="معاينة الفئة"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ImagePlus className="h-4 w-4" />
                    {uploading ? 'جارٍ الرفع...' : 'رفع صورة'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading || saving}
                      onChange={(e) => handleImagePick(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      className="block text-xs text-red-600 hover:underline"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, imageUrl: '', imageKey: '' }))
                      }
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
              />
              فئة نشطة (تظهر للمعلمين والزوار)
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : editing ? (
                'حفظ التعديلات'
              ) : (
                'إنشاء الفئة'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
