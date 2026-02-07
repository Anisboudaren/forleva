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
import { ShoppingBag, FileText, Search, Loader2, Copy, MessageCircle } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

type Order = {
  id: string
  userId: string
  courseId: string
  status: OrderStatus
  amount: number
  createdAt: string
  updatedAt: string
  user: { id: string; fullName: string | null; email: string | null; phone: string | null; whatsapp: string | null }
  course: { id: string; title: string }
}

type ClientInfo = {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'CONFIRMED', label: 'مؤكد' },
  { value: 'CANCELLED', label: 'ملغي' },
]

function shortId(id: string) {
  return id.slice(0, 8)
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString()} د.ج`
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [clientPanelUserId, setClientPanelUserId] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [clientInfoLoading, setClientInfoLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (searchDebounced) params.set('search', searchDebounced)
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchDebounced])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Client panel: fetch user when opening
  useEffect(() => {
    if (!clientPanelUserId) {
      setClientInfo(null)
      return
    }
    setClientInfoLoading(true)
    setClientInfo(null)
    fetch(`/api/admin/users/${clientPanelUserId}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setClientInfo(data)
      })
      .catch(() => setClientInfo(null))
      .finally(() => setClientInfoLoading(false))
  }, [clientPanelUserId])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
      }
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const totalCount = orders.length
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

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

  return (
    <div className="flex flex-1 flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="الطلبات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          عرض وإدارة طلبات شراء الدورات
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={ShoppingBag}
          title="إجمالي الطلبات"
          value={totalCount}
          description="طلب"
        />
        <DashboardCard
          variant="yellow"
          icon={FileText}
          title="قيد المعالجة"
          value={pendingCount}
          description="في انتظار التأكيد أو الدفع"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث برقم الطلب أو العميل..."
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
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DashboardContentCard
        title="قائمة الطلبات"
        description={orders.length === 0 && !loading ? 'لا توجد طلبات حتى الآن' : undefined}
        icon={ShoppingBag}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد طلبات</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              ستظهر هنا طلبات شراء الدورات عندما يقدّم الطلاب طلبات اشتراك ويتم ربطها بنظام الطلبات.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">الدورة</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-gray-600">{shortId(order.id)}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="text-amber-600 hover:underline font-medium"
                      onClick={() => setClientPanelUserId(order.user.id)}
                    >
                      {order.user.fullName || order.user.email || order.user.phone || '—'}
                    </button>
                  </TableCell>
                  <TableCell>{order.course.title}</TableCell>
                  <TableCell>{formatAmount(order.amount)}</TableCell>
                  <TableCell>
                    <select
                      className="py-1.5 px-2 text-sm border border-gray-200 rounded-md bg-white min-w-[120px]"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingOrderId === order.id}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {updatingOrderId === order.id && (
                      <Loader2 className="inline-block w-4 h-4 mr-1 animate-spin" />
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardContentCard>

      <Sheet open={!!clientPanelUserId} onOpenChange={(open) => !open && setClientPanelUserId(null)}>
        <SheetContent side="left" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>معلومات العميل</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            {clientInfoLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            )}
            {!clientInfoLoading && clientInfo && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium">{clientInfo.fullName || '—'}</span>
                  {clientInfo.fullName && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(clientInfo.fullName!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">البريد:</span>
                  <span dir="ltr" className="text-left">{clientInfo.email || '—'}</span>
                  {clientInfo.email && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(clientInfo.email!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">الهاتف:</span>
                  <span dir="ltr">{clientInfo.phone || '—'}</span>
                  {clientInfo.phone && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(clientInfo.phone!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">واتساب:</span>
                  {clientInfo.whatsapp || clientInfo.phone ? (
                    <a
                      href={whatsappLink(clientInfo.whatsapp || clientInfo.phone)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-600 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      فتح واتساب
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>
            )}
            {!clientInfoLoading && !clientInfo && clientPanelUserId && (
              <p className="text-gray-500">تعذر تحميل البيانات</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
