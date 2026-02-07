"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { UserCog, Search, Mail, Plus, MoreHorizontal, Trash2, Eye, Pencil } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { useCanCreateAdmins } from "@/lib/admin-role-context"

type AdminStatusType = "active" | "pending" | "suspended" | "blocked"
type AdminRoleType = "super_admin" | "admin"

interface Admin {
  id: string
  fullName: string
  phone: string
  whatsapp?: string
  email?: string
  role: AdminRoleType
  joinDate: string
  lastActive: string
  status: AdminStatusType
}

const ADMIN_ROLE_LABELS: Record<AdminRoleType, string> = {
  super_admin: "مدير عام",
  admin: "مسؤول",
}

const ITEMS_PER_PAGE = 5
const STATUS_OPTIONS: { value: AdminStatusType; label: string }[] = [
  { value: "active", label: "نشط" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "suspended", label: "موقوف" },
  { value: "blocked", label: "محظور" },
]
const STATUS_BADGE_CLASS: Record<AdminStatusType, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-orange-100 text-orange-700",
  blocked: "bg-red-100 text-red-700",
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    password: "",
    role: "admin" as AdminRoleType,
  })
  const canCreateAdmins = useCanCreateAdmins()
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<Admin | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [detailsAdmin, setDetailsAdmin] = useState<Admin | null>(null)
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null)
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    role: "admin" as AdminRoleType,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const openEdit = (admin: Admin) => {
    setEditAdmin(admin)
    setEditForm({
      fullName: admin.fullName,
      phone: admin.phone,
      whatsapp: admin.whatsapp || "",
      email: admin.email || "",
      role: admin.role,
    })
    setEditError(null)
    setOpenMenuId(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editAdmin) return
    setEditLoading(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/admin/admins/${editAdmin.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone.replace(/\s/g, ""),
          whatsapp: editForm.whatsapp || undefined,
          email: editForm.email || undefined,
          role: editForm.role,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setEditError((data.error as string) || "فشل التحديث")
        setEditLoading(false)
        return
      }
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editAdmin.id
            ? {
                ...a,
                fullName: editForm.fullName,
                phone: editForm.phone,
                whatsapp: editForm.whatsapp || undefined,
                email: editForm.email || undefined,
                role: editForm.role,
              }
            : a
        )
      )
      setEditAdmin(null)
    } catch {
      setEditError("حدث خطأ في الاتصال")
    }
    setEditLoading(false)
  }

  const handleStatusChange = async (adminId: string, newStatus: AdminStatusType) => {
    setUpdatingStatusId(adminId)
    try {
      const res = await fetch(`/api/admin/users/${adminId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      })
      if (res.ok) {
        setAdmins((prev) =>
          prev.map((a) => (a.id === adminId ? { ...a, status: newStatus } : a))
        )
      }
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!deleteConfirmAdmin) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/users/${deleteConfirmAdmin.id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== deleteConfirmAdmin.id))
        setDeleteConfirmAdmin(null)
      } else {
        const data = await res.json().catch(() => ({}))
        setDeleteError((data.error as string) || "فشل الحذف")
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function fetchAdmins() {
      try {
        const res = await fetch("/api/admin/admins", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setAdmins(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setAdmins([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAdmins()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const searchLower = search.toLowerCase()
      return (
        admin.fullName.toLowerCase().includes(searchLower) ||
        admin.phone.includes(search) ||
        (admin.email && admin.email.toLowerCase().includes(searchLower))
      )
    })
  }, [search, admins])

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE)
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAdmins.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAdmins, currentPage])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)
    try {
      const res = await fetch("/api/admin/admins/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: createForm.fullName,
          phone: createForm.phone,
          whatsapp: createForm.whatsapp || undefined,
          email: createForm.email || undefined,
          password: createForm.password,
          role: createForm.role === "super_admin" ? "SUPER_ADMIN" : "ADMIN",
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError((data.error as string) || "حدث خطأ أثناء الإضافة")
        return
      }
      setCreateForm({ fullName: "", phone: "", whatsapp: "", email: "", password: "", role: "admin" })
      setCreateOpen(false)
      const refetch = await fetch("/api/admin/admins", { credentials: "include" })
      if (refetch.ok) {
        const list = await refetch.json()
        setAdmins(Array.isArray(list) ? list : [])
      }
    } catch {
      setCreateError("حدث خطأ في الاتصال")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="المسؤولون" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          إدارة المسؤولين وصولهم إلى لوحة الإدارة
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <DashboardCard
          variant="blue"
          icon={UserCog}
          title="إجمالي المسؤولين"
          value={admins.length}
          description="مسؤول نشط"
        />
        <DashboardCard
          variant="purple"
          icon={UserCog}
          title="النشطون"
          value={admins.filter((a) => a.status === "active").length}
          description="مسؤول نشط"
        />
      </div>

      <DashboardContentCard
        title="جدول المسؤولين"
        description={`${filteredAdmins.length} مسؤول`}
        icon={UserCog}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الهاتف أو البريد..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                dir="rtl"
              />
            </div>
            {canCreateAdmins && (
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (open) setCreateError(null) }}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
                  <Plus className="h-4 w-4" />
                  إضافة مسؤول
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة مسؤول جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin}>
                  {createError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                      {createError}
                    </p>
                  )}
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel className="text-gray-900 font-medium">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        value={createForm.fullName}
                        onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                        placeholder="أدخل الاسم الكامل"
                        required
                        dir="rtl"
                        className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-gray-900 font-medium">
                        رقم الهاتف الجزائري <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        type="tel"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="05XX XX XX XX"
                        required
                        pattern="^0[567][0-9]{8}$"
                        dir="rtl"
                        className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-gray-900 font-medium text-sm">رقم الواتساب</FieldLabel>
                      <Input
                        type="tel"
                        value={createForm.whatsapp}
                        onChange={(e) => setCreateForm((f) => ({ ...f, whatsapp: e.target.value }))}
                        placeholder="05XX XX XX XX (اختياري)"
                        dir="rtl"
                        className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                      <FieldDescription className="text-gray-500 text-xs mt-1">
                        يمكنك ترك هذا الحقل فارغاً إذا كان نفس رقم الهاتف
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel className="text-gray-900 font-medium">البريد الإلكتروني</FieldLabel>
                      <Input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="m@example.com (اختياري)"
                        dir="rtl"
                        className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                      <FieldDescription className="text-gray-500 text-sm">
                        اختياري - يمكنك إضافته لاحقاً
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel className="text-gray-900 font-medium">نوع المسؤول</FieldLabel>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as AdminRoleType }))}
                        className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        dir="rtl"
                      >
                        <option value="admin">{ADMIN_ROLE_LABELS.admin}</option>
                        <option value="super_admin">{ADMIN_ROLE_LABELS.super_admin}</option>
                      </select>
                      <FieldDescription className="text-gray-500 text-xs mt-1">
                        مدير عام يمكنه إضافة مسؤولين؛ المسؤول لا يمكنه ذلك
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel className="text-gray-900 font-medium">
                        كلمة المرور <span className="text-red-500">*</span>
                      </FieldLabel>
                      <PasswordInput
                        value={createForm.password}
                        onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        required
                        dir="rtl"
                        className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </Field>
                  </FieldGroup>
                  <DialogFooter className="mt-6 gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={createLoading} className="bg-amber-500 hover:bg-amber-600">
                      {createLoading ? "جاري الإضافة..." : "إضافة المسؤول"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-12 px-4 text-center text-gray-500">
                جاري تحميل المسؤولين...
              </div>
            ) : admins.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-gray-600 mb-4">لا يوجد مسؤولون حتى الآن.</p>
                {canCreateAdmins && (
                  <Button
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مسؤول
                  </Button>
                )}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">المسؤول</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">النوع</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">الهاتف</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 hidden md:table-cell">البريد</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 hidden sm:table-cell">تاريخ الانضمام</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">آخر نشاط</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 hidden sm:table-cell">الحالة</TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4 px-4 w-12">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAdmins.map((admin) => (
                  <TableRow
                    key={admin.id}
                    className="group border-b border-gray-100 last:border-0 hover:bg-amber-50/30 transition-colors"
                  >
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                          {admin.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{admin.fullName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-lg text-xs font-medium",
                          admin.role === "super_admin"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {ADMIN_ROLE_LABELS[admin.role ?? "admin"]}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-600 text-sm">{admin.phone}</TableCell>
                    <TableCell className="py-4 px-4 hidden md:table-cell text-gray-600 text-sm">
                      {admin.email || "—"}
                    </TableCell>
                    <TableCell className="py-4 px-4 hidden sm:table-cell text-gray-600 text-sm">
                      {admin.joinDate}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-600 text-sm">{admin.lastActive}</TableCell>
                    <TableCell className="py-4 px-4 hidden sm:table-cell">
                      <select
                        value={admin.status}
                        onChange={(e) => handleStatusChange(admin.id, e.target.value as AdminStatusType)}
                        disabled={updatingStatusId === admin.id}
                        className={cn(
                          "min-w-[100px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50",
                          STATUS_BADGE_CLASS[admin.status]
                        )}
                        dir="rtl"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setDetailsAdmin(admin)}
                          aria-label="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <div className="relative" ref={openMenuId === admin.id ? menuRef : undefined}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)}
                            aria-label="المزيد"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                          {openMenuId === admin.id && (
                            <div
                              className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                              dir="rtl"
                            >
                              {canCreateAdmins && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => openEdit(admin)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  تعديل
                                </button>
                              )}
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => { setDeleteConfirmAdmin(admin); setOpenMenuId(null) }}
                              >
                                <Trash2 className="h-4 w-4" />
                                حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Delete confirmation dialog */}
          <Dialog open={!!deleteConfirmAdmin} onOpenChange={(open) => { if (!open) { setDeleteConfirmAdmin(null); setDeleteError(null) } }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>تأكيد الحذف</DialogTitle>
              </DialogHeader>
              {deleteError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  {deleteError}
                </p>
              )}
              <p className="text-gray-600 text-sm">
                هل أنت متأكد من حذف المسؤول <strong>{deleteConfirmAdmin?.fullName}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirmAdmin(null)} disabled={deleteLoading}>
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAdmin}
                  disabled={deleteLoading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteLoading ? "جاري الحذف..." : "حذف"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!detailsAdmin} onOpenChange={(open) => { if (!open) setDetailsAdmin(null) }}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>تفاصيل المسؤول</DialogTitle>
              </DialogHeader>
              {detailsAdmin && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">الاسم</span>
                    <span className="font-medium">{detailsAdmin.fullName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">الهاتف</span>
                    <span>{detailsAdmin.phone}</span>
                  </div>
                  {detailsAdmin.whatsapp && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">واتساب</span>
                      <span>{detailsAdmin.whatsapp}</span>
                    </div>
                  )}
                  {detailsAdmin.email && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">البريد</span>
                      <span>{detailsAdmin.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">النوع</span>
                    <span>{ADMIN_ROLE_LABELS[detailsAdmin.role]}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">الحالة</span>
                    <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", STATUS_BADGE_CLASS[detailsAdmin.status])}>
                      {STATUS_OPTIONS.find((o) => o.value === detailsAdmin.status)?.label ?? detailsAdmin.status}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">تاريخ الانضمام</span>
                    <span>{detailsAdmin.joinDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">آخر نشاط</span>
                    <span>{detailsAdmin.lastActive}</span>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsAdmin(null)}>إغلاق</Button>
                {canCreateAdmins && detailsAdmin && (
                  <Button onClick={() => detailsAdmin && (setDetailsAdmin(null), openEdit(detailsAdmin))} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    تعديل
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {canCreateAdmins && (
          <Dialog open={!!editAdmin} onOpenChange={(open) => { if (!open) { setEditAdmin(null); setEditError(null) } }}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>تعديل المسؤول</DialogTitle>
              </DialogHeader>
              {editError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  {editError}
                </p>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <FieldGroup>
                  <FieldLabel>الاسم الكامل</FieldLabel>
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="الاسم الكامل"
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>رقم الهاتف</FieldLabel>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>واتساب (اختياري)</FieldLabel>
                  <Input
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>البريد الإلكتروني (اختياري)</FieldLabel>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>نوع المسؤول</FieldLabel>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as AdminRoleType }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    dir="rtl"
                  >
                    <option value="admin">{ADMIN_ROLE_LABELS.admin}</option>
                    <option value="super_admin">{ADMIN_ROLE_LABELS.super_admin}</option>
                  </select>
                </FieldGroup>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditAdmin(null)} disabled={editLoading}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={editLoading}>
                    {editLoading ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}

          {!loading && admins.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)} من {filteredAdmins.length}
              </p>
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage((p) => p - 1)
                      }}
                      className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer min-w-9"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage((p) => p + 1)
                      }}
                      className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </DashboardContentCard>
    </div>
  )
}
