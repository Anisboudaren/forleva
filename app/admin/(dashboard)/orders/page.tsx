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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { ShoppingBag, FileText, Search, Loader2, Copy, MessageCircle, Eye, Phone, UserPlus, CheckCircle2 } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'
import type { PaymentMethod } from '@/lib/schema-enums'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

type Order = {
  id: string
  userId: string | null
  courseId: string
  status: OrderStatus
  amount: number
  deliveryFee: number
  paymentMethod: PaymentMethod | null
  guestFullName: string | null
  guestPhone: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
  } | null
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

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CHARGILY: 'شارجيلي (إيداهابيا)',
  CASH_ON_DELIVERY: 'الدفع عند الاستلام',
}

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

function formatOrderDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatOrderTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString()} د.ج`
}

function orderContactPhone(order: Order): string | null {
  if (order.user?.phone) return order.user.phone
  if (order.guestPhone) return order.guestPhone
  return null
}

function orderContactName(order: Order): string {
  if (order.user) {
    return order.user.fullName || order.user.email || order.user.phone || '—'
  }
  return order.guestFullName || order.guestPhone || 'ضيف'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [clientInfoLoading, setClientInfoLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [createAccountForm, setCreateAccountForm] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    email: '',
    password: '',
  })
  const [createAccountLoading, setCreateAccountLoading] = useState(false)
  const [createAccountError, setCreateAccountError] = useState<string | null>(null)
  const [createAccountSuccess, setCreateAccountSuccess] = useState(false)
  const [existingUserIdToLink, setExistingUserIdToLink] = useState<string | null>(null)

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

  useEffect(() => {
    const userId = selectedOrder?.user?.id
    if (!userId) {
      setClientInfo(null)
      return
    }
    setClientInfoLoading(true)
    setClientInfo(null)
    fetch(`/api/admin/users/${userId}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setClientInfo(data)
      })
      .catch(() => setClientInfo(null))
      .finally(() => setClientInfoLoading(false))
  }, [selectedOrder?.user?.id])

  useEffect(() => {
    if (!selectedOrder || selectedOrder.user) {
      setShowCreateAccount(false)
      setCreateAccountError(null)
      setCreateAccountSuccess(false)
      setExistingUserIdToLink(null)
      return
    }
    setCreateAccountForm({
      fullName: selectedOrder.guestFullName ?? '',
      phone: selectedOrder.guestPhone ?? '',
      whatsapp: selectedOrder.guestPhone ?? '',
      email: '',
      password: '',
    })
  }, [selectedOrder?.id, selectedOrder?.user, selectedOrder?.guestFullName, selectedOrder?.guestPhone])

  const applyOrderUpdate = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    setSelectedOrder(updated)
  }

  const handleLinkOrderToUser = async (userId: string) => {
    if (!selectedOrder) return
    setCreateAccountLoading(true)
    setCreateAccountError(null)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateAccountError((data.error as string) || 'فشل ربط الطلب بالحساب')
        return
      }
      applyOrderUpdate(data as Order)
      setCreateAccountSuccess(true)
      setShowCreateAccount(false)
      setExistingUserIdToLink(null)
    } catch {
      setCreateAccountError('حدث خطأ في الاتصال')
    } finally {
      setCreateAccountLoading(false)
    }
  }

  const handleCreateAndLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setCreateAccountLoading(true)
    setCreateAccountError(null)
    setExistingUserIdToLink(null)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/create-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: createAccountForm.fullName.trim(),
          phone: createAccountForm.phone.replace(/\s/g, ''),
          whatsapp: createAccountForm.whatsapp.replace(/\s/g, '') || undefined,
          email: createAccountForm.email.trim() || undefined,
          password: createAccountForm.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateAccountError((data.error as string) || 'فشل إنشاء الحساب')
        if (typeof data.existingUserId === 'string') {
          setExistingUserIdToLink(data.existingUserId)
        }
        return
      }
      if (data.order) {
        applyOrderUpdate(data.order as Order)
      }
      setCreateAccountSuccess(true)
      setShowCreateAccount(false)
    } catch {
      setCreateAccountError('حدث خطأ في الاتصال')
    } finally {
      setCreateAccountLoading(false)
    }
  }

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
        applyOrderUpdate(updated)
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

  const telLink = (phone: string | null) => {
    if (!phone) return null
    const num = phone.replace(/\D/g, '')
    return `tel:${num.startsWith('0') ? `+213${num.slice(1)}` : `+${num}`}`
  }

  const detailPhone = selectedOrder ? orderContactPhone(selectedOrder) : null
  const detailName = selectedOrder ? orderContactName(selectedOrder) : '—'
  const detailEmail = selectedOrder?.user?.email ?? clientInfo?.email ?? null
  const detailWhatsapp = selectedOrder?.user?.whatsapp ?? clientInfo?.whatsapp ?? detailPhone

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
          <>
            {/* Mobile: compact list */}
            <ul className="md:hidden divide-y divide-gray-100 -mx-1">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 py-3 px-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate flex items-center gap-1.5">
                      {!order.user && (
                        <span className="shrink-0 text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded">ضيف</span>
                      )}
                      <span className="truncate">{orderContactName(order)}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <span>{formatOrderDate(order.createdAt)}</span>
                      <span className="text-gray-300">·</span>
                      <span dir="ltr">{formatOrderTime(order.createdAt)}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8 px-2.5 text-xs rounded-lg gap-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    تفاصيل
                  </Button>
                </li>
              ))}
            </ul>

            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">الدورة</TableHead>
                <TableHead className="text-right">الدفع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">تفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-gray-600">{shortId(order.id)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
                      {!order.user && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">ضيف</span>
                      )}
                      {orderContactName(order)}
                    </span>
                    {orderContactPhone(order) && (
                      <span className="block text-xs text-gray-500 mt-0.5" dir="ltr">
                        {orderContactPhone(order)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{order.course.title}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] : '—'}
                  </TableCell>
                  <TableCell>
                    <span>{formatAmount(order.amount)}</span>
                    {order.deliveryFee > 0 && (
                      <span className="block text-xs text-gray-500">يشمل {order.deliveryFee} د.ج توصيل</span>
                    )}
                  </TableCell>
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
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-lg"
                      onClick={() => setSelectedOrder(order)}
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
          </>
        )}
      </DashboardContentCard>

      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null)
            setShowCreateAccount(false)
            setCreateAccountError(null)
            setCreateAccountSuccess(false)
            setExistingUserIdToLink(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full max-h-dvh overflow-hidden">
          <SheetHeader className="border-b border-gray-100">
            <SheetTitle>تفاصيل الطلب</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 text-sm">
              {/* Order info */}
              <section className="space-y-2">
                <h3 className="font-semibold text-gray-900">معلومات الطلب</h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">رقم الطلب</span>
                    <span className="font-mono text-xs">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">الحالة</span>
                    <div className="flex items-center gap-2">
                      <select
                        className="py-1.5 px-2 text-sm border border-gray-200 rounded-md bg-white min-w-[120px]"
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                        disabled={updatingOrderId === selectedOrder.id}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {updatingOrderId === selectedOrder.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">التاريخ</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">الدورة</span>
                    <span className="font-medium text-left">{selectedOrder.course.title}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">طريقة الدفع</span>
                    <span>
                      {selectedOrder.paymentMethod ? PAYMENT_LABELS[selectedOrder.paymentMethod] : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">المبلغ</span>
                    <span className="font-semibold text-amber-700">{formatAmount(selectedOrder.amount)}</span>
                  </div>
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600">رسوم التوصيل</span>
                      <span>{formatAmount(selectedOrder.deliveryFee)}</span>
                    </div>
                  )}
                  {selectedOrder.adminNotes && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600 block mb-1">ملاحظات</span>
                      <p className="text-gray-800">{selectedOrder.adminNotes}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Contact info */}
              <section className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  {selectedOrder.user ? 'معلومات العميل' : 'معلومات الضيف'}
                </h3>
                {!selectedOrder.user && (
                  <>
                    <span className="inline-block text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      طلب بدون حساب
                    </span>
                    {createAccountSuccess ? (
                      <p className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        تم إنشاء الحساب وربط الطلب بنجاح. يمكن للطالب تسجيل الدخول والوصول للدورة عند تأكيد الطلب.
                      </p>
                    ) : !showCreateAccount ? (
                      <Button
                        type="button"
                        className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
                        onClick={() => setShowCreateAccount(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        إنشاء حساب وربط الطلب
                      </Button>
                    ) : (
                      <form
                        onSubmit={handleCreateAndLinkAccount}
                        className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 space-y-3"
                      >
                        <p className="text-sm font-medium text-gray-900">إنشاء حساب طالب</p>
                        <div className="space-y-2">
                          <Label htmlFor="guest-account-name">الاسم الكامل</Label>
                          <Input
                            id="guest-account-name"
                            value={createAccountForm.fullName}
                            onChange={(e) =>
                              setCreateAccountForm((f) => ({ ...f, fullName: e.target.value }))
                            }
                            required
                            className="text-right bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guest-account-phone">رقم الهاتف</Label>
                          <Input
                            id="guest-account-phone"
                            type="tel"
                            dir="ltr"
                            value={createAccountForm.phone}
                            onChange={(e) =>
                              setCreateAccountForm((f) => ({ ...f, phone: e.target.value }))
                            }
                            required
                            pattern="^0[567][0-9]{8}$"
                            className="text-left bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guest-account-whatsapp">واتساب (اختياري)</Label>
                          <Input
                            id="guest-account-whatsapp"
                            type="tel"
                            dir="ltr"
                            value={createAccountForm.whatsapp}
                            onChange={(e) =>
                              setCreateAccountForm((f) => ({ ...f, whatsapp: e.target.value }))
                            }
                            className="text-left bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guest-account-email">البريد (اختياري)</Label>
                          <Input
                            id="guest-account-email"
                            type="email"
                            dir="ltr"
                            value={createAccountForm.email}
                            onChange={(e) =>
                              setCreateAccountForm((f) => ({ ...f, email: e.target.value }))
                            }
                            className="text-left bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guest-account-password">كلمة المرور</Label>
                          <PasswordInput
                            id="guest-account-password"
                            value={createAccountForm.password}
                            onChange={(e) =>
                              setCreateAccountForm((f) => ({ ...f, password: e.target.value }))
                            }
                            required
                            minLength={6}
                            className="text-right bg-white"
                          />
                        </div>
                        {createAccountError && (
                          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                            {createAccountError}
                          </p>
                        )}
                        {existingUserIdToLink && (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full text-xs"
                            disabled={createAccountLoading}
                            onClick={() => handleLinkOrderToUser(existingUserIdToLink)}
                          >
                            ربط الطلب بالحساب الموجود
                          </Button>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            disabled={createAccountLoading}
                            onClick={() => {
                              setShowCreateAccount(false)
                              setCreateAccountError(null)
                              setExistingUserIdToLink(null)
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-amber-500 hover:bg-amber-600"
                            disabled={createAccountLoading}
                          >
                            {createAccountLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                                جاري الإنشاء...
                              </>
                            ) : (
                              'إنشاء وربط'
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                )}
                <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-600">الاسم</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{detailName}</span>
                      {detailName !== '—' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(detailName)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-600">الهاتف</span>
                    <div className="flex items-center gap-1">
                      <span dir="ltr" className="font-medium">{detailPhone || '—'}</span>
                      {detailPhone && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(detailPhone)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {(detailEmail || clientInfoLoading) && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-600">البريد</span>
                      {clientInfoLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <span dir="ltr">{detailEmail || '—'}</span>
                          {detailEmail && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => copyToClipboard(detailEmail)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {detailPhone && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                      <a
                        href={telLink(detailPhone)!}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white font-medium hover:bg-green-700 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        اتصال
                      </a>
                      <a
                        href={whatsappLink(detailWhatsapp)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <MessageCircle className="h-4 w-4" />
                        واتساب
                      </a>
                    </div>
                  )}
                  {!detailPhone && (
                    <p className="text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs">
                      لا يوجد رقم هاتف مسجّل لهذا الطلب.
                    </p>
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
