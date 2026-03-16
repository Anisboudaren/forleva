'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardContentCard } from '@/components/dashboard/DashboardCard'
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
import { GradientText } from '@/components/text/gradient-text'
import { Loader2 } from 'lucide-react'
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS } from '@/lib/audit-actions'

type AuditLogItem = {
  id: string
  createdAt: string
  actor: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    role: string
  }
  actorRole: string
  action: string
  entityType: string
  entityId?: string
  meta?: Record<string, unknown>
}

type ApiResponse = {
  items: AuditLogItem[]
  total: number
  page: number
  pageSize: number
}

const ENTITY_TYPES = [
  { value: '', label: 'كل الأنواع' },
  { value: 'order', label: 'الطلبات' },
  { value: 'review', label: 'التقييمات' },
  { value: 'course', label: 'الدورات' },
  { value: 'user', label: 'المستخدمون' },
  { value: 'admin', label: 'المسؤولون' },
]

const PAGE_SIZE_OPTIONS = [20, 50, 100]

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('ar-DZ', {
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

function actionLabel(action: string) {
  const entries = Object.entries(AUDIT_ACTIONS) as [keyof typeof AUDIT_ACTIONS, string][]
  const match = entries.find(([, code]) => code === action)
  if (!match) return action
  const label = AUDIT_ACTION_LABELS[match[1] as keyof typeof AUDIT_ACTION_LABELS]
  return label ?? action
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const [actorId, setActorId] = useState('')
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const totalPages = useMemo(() => {
    if (!total) return 1
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (actorId) params.set('actorId', actorId.trim())
      if (action) params.set('action', action)
      if (entityType) params.set('entityType', entityType)
      if (entityId) params.set('entityId', entityId.trim())
      if (from) params.set('from', from)
      if (to) params.set('to', to)

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        setLogs([])
        setTotal(0)
        return
      }
      const data: ApiResponse = await res.json()
      setLogs(data.items)
      setTotal(data.total)
    } catch {
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [actorId, action, entityType, entityId, from, to, page, pageSize])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleApplyFilters = () => {
    setPage(1)
    fetchLogs()
  }

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const actionOptions = useMemo(
    () =>
      Object.values(AUDIT_ACTIONS).map((code) => ({
        value: code,
        label: actionLabel(code),
      })),
    []
  )

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText
            text="سجل النشاط"
            gradient="linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)"
          />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          تتبع جميع العمليات المهمة التي يقوم بها المسؤولون والأساتذة داخل لوحة التحكم.
        </p>
      </div>

      <DashboardContentCard
        title="الفلاتر"
        description="حدد المستخدم، نوع العملية، الكيان أو الفترة الزمنية لعرض السجل بدقة."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">معرّف المنفّذ (actorId)</label>
            <Input
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              placeholder="ID المستخدم الذي قام بالفعل"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">نوع العملية</label>
            <select
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">كل العمليات</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">نوع الكيان</label>
            <select
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
            >
              {ENTITY_TYPES.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">معرّف الكيان (entityId)</label>
            <Input
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="مثال: معرف الطلب أو التقييم"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">من تاريخ</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">إلى تاريخ</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">عدد العناصر في الصفحة</label>
            <select
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} سجل
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              className="w-full"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              تطبيق الفلاتر
            </Button>
          </div>
        </div>
      </DashboardContentCard>

      <DashboardContentCard
        title="سجل العمليات"
        description={
          total
            ? `إجمالي ${total} عملية مسجلة.`
            : loading
            ? 'جارٍ تحميل السجل...'
            : 'لا توجد عمليات مسجلة بعد للفلاتر الحالية.'
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-600">
            لا توجد سجلات مطابقة للفلاتر المحددة.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المنفّذ</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">العملية</TableHead>
                  <TableHead className="text-right">الكيان</TableHead>
                  <TableHead className="text-right">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {log.actor.name || '—'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.actor.email || log.actor.phone || log.actor.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {log.actorRole || log.actor.role}
                    </TableCell>
                    <TableCell className="text-sm text-gray-800">
                      {actionLabel(log.action)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      <div className="flex flex-col items-start gap-0.5">
                        <span>{log.entityType}</span>
                        {log.entityId && (
                          <span className="font-mono text-[11px] text-gray-500">
                            {log.entityId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 max-w-xs">
                      {log.entityType === 'order' && log.meta && (
                        <span>
                          حالة الطلب: {(log.meta.status as string) || '—'} / المبلغ:{' '}
                          {(log.meta.amount as number | undefined) ?? ''}
                        </span>
                      )}
                      {log.entityType === 'course' && log.meta && (
                        <span>
                          {String(log.meta.courseTitle)} ({String(log.meta.previousStatus)} ➝{' '}
                          {String(log.meta.newStatus)})
                        </span>
                      )}
                      {log.entityType === 'review' && log.meta && (
                        <span>
                          تقييم على دورة: {String(log.meta.courseTitle)} (ID:{' '}
                          {String(log.meta.reviewId)})
                        </span>
                      )}
                      {log.entityType === 'user' && log.meta && (
                        <span>
                          حالة المستخدم: {String(log.meta.previousStatus)} ➝{' '}
                          {String(log.meta.newStatus)}
                        </span>
                      )}
                      {log.entityType === 'admin' && log.meta && (
                        <span>
                          مسؤول: {String(log.meta.adminName)} (الدور: {String(
                            log.meta.previousRole
                          )}{' '}
                          ➝ {String(log.meta.newRole || log.meta.adminRole)})
                        </span>
                      )}
                      {!log.meta && <span className="text-gray-400">لا توجد تفاصيل إضافية</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-600">
              <div>
                صفحة {page} من {totalPages} — عرض {logs.length} من {total} سجل
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  السابق
                </Button>
                <span>
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  التالي
                </Button>
              </div>
            </div>
          </>
        )}
      </DashboardContentCard>
    </div>
  )
}

