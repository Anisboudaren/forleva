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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/ui/table-pagination'
import { Award, Search, Loader2, Copy, MessageCircle, Eye, Phone, Upload, FileText, Download } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'
import { CERTIFICATE_TYPE_LABELS } from '@/lib/certificate-constants'
import { isCertificateImageMime } from '@/lib/certificate-file'
import type { CertificateRequestStatus, CertificateType } from '@/lib/schema-enums'

type CertRequest = {
  id: string
  userId: string
  courseId: string
  certificateType: CertificateType
  fullName: string
  placeOfBirth: string
  dateOfBirth: string
  note: string | null
  status: CertificateRequestStatus
  adminNotes: string | null
  certificateFileUrl: string | null
  certificateFileKey: string | null
  certificateFileName: string | null
  certificateFileMime: string | null
  certificateUploadedAt: string | null
  createdAt: string
  user: {
    id: string
    fullName: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
  }
  course: { id: string; title: string }
}

const STATUS_OPTIONS: { value: CertificateRequestStatus; label: string }[] = [
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'CANCELLED', label: 'ملغي' },
]

function shortId(id: string) {
  return id.slice(0, 8)
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

function formatOrderDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatOrderTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatBirthDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-DZ')
  } catch {
    return dateStr
  }
}

export default function AdminCertificatesPage() {
  const [requests, setRequests] = useState<CertRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selected, setSelected] = useState<CertRequest | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [uploadCertError, setUploadCertError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchDebounced])

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))
  const paginatedRequests = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (searchDebounced) params.set('search', searchDebounced)
      const res = await fetch(`/api/admin/certificate-requests?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchDebounced])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleStatusChange = async (id: string, status: CertificateRequestStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/certificate-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)))
        setSelected((prev) => (prev?.id === id ? updated : prev))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCertUpload = async () => {
    if (!selected || !certFile || uploadingCert) return
    setUploadingCert(true)
    setUploadCertError(null)
    try {
      const form = new FormData()
      form.append('file', certFile)
      const res = await fetch(`/api/admin/certificate-requests/${selected.id}/certificate-file`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.ok === false) {
        setUploadCertError(data.error || 'فشل رفع ملف الشهادة')
        return
      }
      const updated = data.request as CertRequest
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setSelected(updated)
      setCertFile(null)
    } catch {
      setUploadCertError('تعذر الاتصال بالسيرفر')
    } finally {
      setUploadingCert(false)
    }
  }

  const copyToClipboard = (text: string) => {
    if (typeof navigator?.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text)
    }
  }

  const whatsappLink = (phone: string | null) => {
    if (!phone) return null
    const num = phone.replace(/\D/g, '')
    const wa = num.startsWith('0') ? `213${num.slice(1)}` : num
    return `https://wa.me/${wa}`
  }

  const telLink = (phone: string | null) => {
    if (!phone) return null
    const num = phone.replace(/\D/g, '')
    return `tel:${num.startsWith('0') ? `+213${num.slice(1)}` : `+${num}`}`
  }

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const phone = selected?.user.phone ?? null

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText
            text="طلبات الشهادات"
            gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
          />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">عرض ومعالجة طلبات الشهادات من الطلاب</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard variant="blue" icon={Award} title="إجمالي الطلبات" value={requests.length} description="طلب" />
        <DashboardCard variant="yellow" icon={Award} title="قيد الانتظار" value={pendingCount} description="بانتظار المعالجة" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الدورة أو الهاتف..."
            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DashboardContentCard
        title="قائمة طلبات الشهادات"
        description={requests.length === 0 && !loading ? 'لا توجد طلبات حتى الآن' : undefined}
        icon={Award}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Award className="h-12 w-12 text-amber-400 mb-3" />
            <p className="text-gray-600 text-sm">ستظهر هنا طلبات الشهادات عندما يقدّمها الطلاب.</p>
          </div>
        ) : (
          <>
            <ul className="md:hidden divide-y divide-gray-100 -mx-1">
              {paginatedRequests.map((req) => (
                <li key={req.id} className="flex items-center gap-3 py-3 px-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{req.fullName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{req.course.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <span>{formatOrderDate(req.createdAt)}</span>
                      <span className="text-gray-300">·</span>
                      <span dir="ltr">{formatOrderTime(req.createdAt)}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8 px-2.5 text-xs rounded-lg gap-1"
                    onClick={() => setSelected(req)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    تفاصيل
                  </Button>
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الدورة</TableHead>
                    <TableHead className="text-right">نوع الشهادة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">تفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <span className="font-medium">{req.fullName}</span>
                        {req.user.phone && (
                          <span className="block text-xs text-gray-500 mt-0.5" dir="ltr">
                            {req.user.phone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{req.course.title}</TableCell>
                      <TableCell className="text-sm">
                        {CERTIFICATE_TYPE_LABELS[req.certificateType]}
                      </TableCell>
                      <TableCell>
                        <select
                          className="py-1.5 px-2 text-sm border border-gray-200 rounded-md bg-white min-w-[120px]"
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(req.id, e.target.value as CertificateRequestStatus)
                          }
                          disabled={updatingId === req.id}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">{formatDate(req.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-lg"
                          onClick={() => setSelected(req)}
                        >
                          <Eye className="h-4 w-4" />
                          تفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              page={page}
              totalPages={totalPages}
              totalItems={requests.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </DashboardContentCard>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full max-h-dvh overflow-hidden">
          <SheetHeader className="border-b border-gray-100">
            <SheetTitle>تفاصيل طلب الشهادة</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5 text-sm">
              <section className="space-y-2">
                <h3 className="font-semibold text-gray-900">الطلب</h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">رقم الطلب</span>
                    <span className="font-mono text-xs">{shortId(selected.id)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">الحالة</span>
                    <select
                      className="py-1.5 px-2 text-sm border border-gray-200 rounded-md bg-white"
                      value={selected.status}
                      onChange={(e) =>
                        handleStatusChange(selected.id, e.target.value as CertificateRequestStatus)
                      }
                      disabled={updatingId === selected.id}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">نوع الشهادة</span>
                    <span>{CERTIFICATE_TYPE_LABELS[selected.certificateType]}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">الدورة</span>
                    <span className="font-medium text-left">{selected.course.title}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">تاريخ الطلب</span>
                    <span>{formatDate(selected.createdAt)}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-gray-900">بيانات الشهادة</h3>
                <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">الاسم القانوني</span>
                    <span className="font-medium">{selected.fullName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">مكان الولادة</span>
                    <span>{selected.placeOfBirth}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">تاريخ الولادة</span>
                    <span>{formatBirthDate(selected.dateOfBirth)}</span>
                  </div>
                  {selected.note && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 block mb-1">ملاحظة الطالب</span>
                      <p className="text-gray-800">{selected.note}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-gray-900">ملف الشهادة (صورة أو PDF)</h3>
                <p className="text-xs text-gray-500">
                  يُرفع إلى التخزين السحابي في مجلد students-certificates. عند الرفع تُحدَّث الحالة إلى «مكتمل» تلقائياً.
                </p>
                <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                  {selected.certificateFileKey ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">الملف الحالي: </span>
                        {selected.certificateFileName || 'شهادة'}
                      </p>
                      {selected.certificateUploadedAt && (
                        <p className="text-xs text-gray-500">
                          رُفع في {formatDate(selected.certificateUploadedAt)}
                        </p>
                      )}
                      {isCertificateImageMime(selected.certificateFileMime) && (
                        <div className="rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/student/certificate-requests/${selected.id}/file?disposition=inline`}
                            alt="معاينة الشهادة"
                            className="w-full max-h-64 object-contain"
                          />
                        </div>
                      )}
                      <a
                        href={`/api/student/certificate-requests/${selected.id}/file`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                      >
                        <Download className="h-4 w-4" />
                        تحميل الملف
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">لم يُرفع ملف بعد.</p>
                  )}

                  <input
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    className="block w-full text-sm text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
                    onChange={(e) => {
                      setCertFile(e.target.files?.[0] ?? null)
                      setUploadCertError(null)
                    }}
                    disabled={uploadingCert || selected.status === 'CANCELLED'}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleCertUpload}
                    disabled={!certFile || uploadingCert || selected.status === 'CANCELLED'}
                  >
                    {uploadingCert ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingCert ? 'جاري الرفع...' : 'رفع / استبدال الشهادة'}
                  </Button>
                  {uploadCertError && (
                    <p className="text-xs text-red-600" role="alert">
                      {uploadCertError}
                    </p>
                  )}
                  {selected.status === 'CANCELLED' && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      لا يمكن الرفع لطلب ملغى
                    </p>
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-gray-900">معلومات التواصل</h3>
                <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">حساب المنصة</span>
                    <span>{selected.user.fullName || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">الهاتف</span>
                    <div className="flex items-center gap-1">
                      <span dir="ltr">{phone || '—'}</span>
                      {phone && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(phone)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {phone && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                      <a
                        href={telLink(phone)!}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white font-medium"
                      >
                        <Phone className="h-4 w-4" />
                        اتصال
                      </a>
                      <a
                        href={whatsappLink(selected.user.whatsapp || phone)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-white font-medium"
                      >
                        <MessageCircle className="h-4 w-4" />
                        واتساب
                      </a>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
