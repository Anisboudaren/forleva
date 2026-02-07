"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { Users, UserPlus, Search, Mail, MoreHorizontal, Plus, Trash2, Eye, Pencil } from "lucide-react"
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"
import type { UserListItem } from "@/lib/admin-users"

type UserRoleType = "student" | "teacher"
type UserStatusType = "active" | "pending" | "suspended" | "blocked"

const ITEMS_PER_PAGE = 5
const ROLE_LABELS: Record<UserRoleType, string> = {
  student: "طالب",
  teacher: "معلم",
}
const STATUS_OPTIONS: { value: UserStatusType; label: string }[] = [
  { value: "active", label: "نشط" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "suspended", label: "موقوف" },
  { value: "blocked", label: "محظور" },
]
const STATUS_BADGE_CLASS: Record<UserStatusType, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-orange-100 text-orange-700",
  blocked: "bg-red-100 text-red-700",
}

export function AdminUsersPageClient({ initialUsers = [] }: { initialUsers?: UserListItem[] }) {
  const [users, setUsers] = useState<UserListItem[]>(initialUsers)
  const [loading, setLoading] = useState(initialUsers.length === 0)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRoleType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    password: "",
    role: "student" as UserRoleType,
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [detailsUser, setDetailsUser] = useState<UserListItem | null>(null)
  const [editUser, setEditUser] = useState<UserListItem | null>(null)
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", whatsapp: "", email: "", role: "student" as UserRoleType })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleStatusChange = async (userId: string, newStatus: UserStatusType) => {
    setUpdatingStatusId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        )
      }
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/users/${deleteConfirmUser.id}`, { method: "DELETE" })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id))
        setDeleteConfirmUser(null)
      } else {
        const data = await res.json().catch(() => ({}))
        setDeleteError((data.error as string) || "فشل الحذف")
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" })
      const data = await res.json().catch(() => null)
      if (res.ok && Array.isArray(data)) {
        setUsers(data)
      } else {
        setUsers([])
      }
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialUsers.length === 0) setLoading(true)
    fetchUsers()
  }, [fetchUsers, initialUsers.length])

  useEffect(() => {
    const onFocus = () => fetchUsers()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [fetchUsers])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const openEdit = (user: UserListItem) => {
    setEditUser(user)
    setEditForm({
      fullName: user.fullName,
      phone: user.phone,
      whatsapp: user.whatsapp || "",
      email: user.email || "",
      role: user.role,
    })
    setEditError(null)
    setOpenMenuId(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setEditLoading(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
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
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                fullName: editForm.fullName,
                phone: editForm.phone,
                whatsapp: editForm.whatsapp || undefined,
                email: editForm.email || undefined,
                role: editForm.role,
              }
            : u
        )
      )
      setEditUser(null)
    } catch {
      setEditError("حدث خطأ في الاتصال")
    }
    setEditLoading(false)
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchLower) ||
        user.phone.includes(search) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [search, roleFilter, users])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  const studentCount = users.filter((u) => u.role === "student").length
  const teacherCount = users.filter((u) => u.role === "teacher").length

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateLoading(true)
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: createForm.fullName,
          phone: createForm.phone.replace(/\s/g, ""),
          whatsapp: createForm.whatsapp || undefined,
          email: createForm.email || undefined,
          password: createForm.password,
          role: createForm.role,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError(data.error || "فشل إنشاء المستخدم")
        setCreateLoading(false)
        return
      }
      setCreateForm({ fullName: "", phone: "", whatsapp: "", email: "", password: "", role: "student" })
      setCreateOpen(false)
      const listRes = await fetch("/api/admin/users", { credentials: "include" })
      if (listRes.ok) {
        const list = await listRes.json().catch(() => null)
        if (Array.isArray(list)) setUsers(list)
      }
    } catch {
      setCreateError("حدث خطأ أثناء الاتصال")
    }
    setCreateLoading(false)
  }

  const statusForUser = (u: UserListItem): UserStatusType =>
    (u.status === "active" || u.status === "pending" || u.status === "suspended" || u.status === "blocked"
      ? u.status
      : "active")

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="المستخدمين" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          إدارة وعرض جميع مستخدمي المنصة
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={Users}
          title="إجمالي المستخدمين"
          value={loading ? "—" : users.length}
          description="مستخدم مسجل"
        />
        <DashboardCard
          variant="green"
          icon={UserPlus}
          title="الطلاب"
          value={loading ? "—" : studentCount}
          description="طالب"
        />
        <DashboardCard
          variant="yellow"
          icon={UserPlus}
          title="المعلمون"
          value={loading ? "—" : teacherCount}
          description="معلم"
        />
        <DashboardCard
          variant="purple"
          icon={Users}
          title="النشطون"
          value={loading ? "—" : users.filter((u) => u.status === "active").length}
          description="مستخدم نشط"
        />
      </div>

      <DashboardContentCard
        title="جدول المستخدمين"
        description={loading ? "جاري التحميل..." : `${filteredUsers.length} مستخدم`}
        icon={Users}
      >
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">جاري تحميل المستخدمين...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">لا يوجد مستخدمون بعد</p>
              <p className="text-sm text-gray-500 mt-1">أضف مستخدماً جديداً للبدء</p>
              <Button className="mt-4 bg-amber-500 hover:bg-amber-600" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1">
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
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "student", "teacher"] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setRoleFilter(role)
                          setCurrentPage(1)
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                          roleFilter === role ? "bg-amber-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {role === "all" ? "الكل" : ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
                      <Plus className="h-4 w-4" />
                      إضافة مستخدم
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    </DialogHeader>
                    {createError && (
                      <p className="text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg" role="alert">
                        {createError}
                      </p>
                    )}
                    <form onSubmit={handleCreateUser}>
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
                          <FieldDescription className="text-gray-500 text-sm">اختياري - يمكنك إضافته لاحقاً</FieldDescription>
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
                        <Field>
                          <FieldLabel className="text-gray-900 font-medium">الدور</FieldLabel>
                          <select
                            value={createForm.role}
                            onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as UserRoleType }))}
                            className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            dir="rtl"
                          >
                            <option value="student">طالب</option>
                            <option value="teacher">معلم</option>
                          </select>
                        </Field>
                      </FieldGroup>
                      <DialogFooter className="mt-6 gap-2">
                        <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={createLoading} className="bg-amber-500 hover:bg-amber-600">
                          {createLoading ? "جاري الإضافة..." : "إضافة المستخدم"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
                      <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">المستخدم</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">الدور</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 hidden md:table-cell">تاريخ الانضمام</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900 py-4 px-4">آخر نشاط</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 hidden sm:table-cell">الحالة</TableHead>
                      <TableHead className="text-center font-semibold text-gray-900 py-4 px-4 w-12">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="group border-b border-gray-100 last:border-0 hover:bg-amber-50/30 transition-colors">
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email || user.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-1 rounded-lg text-xs font-medium",
                              user.role === "teacher" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            )}
                          >
                            {ROLE_LABELS[user.role]}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-4 hidden md:table-cell text-gray-600 text-sm">{user.joinDate}</TableCell>
                        <TableCell className="py-4 px-4 text-gray-600 text-sm">{user.lastActive}</TableCell>
                        <TableCell className="py-4 px-4 hidden sm:table-cell">
                          <select
                            value={statusForUser(user)}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatusType)}
                            disabled={updatingStatusId === user.id}
                            className={cn(
                              "min-w-[100px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50",
                              STATUS_BADGE_CLASS[statusForUser(user)]
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
                              onClick={() => setDetailsUser(user)}
                              aria-label="عرض التفاصيل"
                            >
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                            <div className="relative" ref={openMenuId === user.id ? menuRef : undefined}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                aria-label="المزيد"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                              {openMenuId === user.id && (
                                <div
                                  className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                  dir="rtl"
                                >
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => openEdit(user)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    تعديل
                                  </button>
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => { setDeleteConfirmUser(user); setOpenMenuId(null) }}
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
              </div>

              <Dialog open={!!deleteConfirmUser} onOpenChange={(open) => { if (!open) { setDeleteConfirmUser(null); setDeleteError(null) } }}>
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
                    هل أنت متأكد من حذف المستخدم <strong>{deleteConfirmUser?.fullName}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
                  </p>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteConfirmUser(null)} disabled={deleteLoading}>
                      إلغاء
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteLoading} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      {deleteLoading ? "جاري الحذف..." : "حذف"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={!!detailsUser} onOpenChange={(open) => { if (!open) setDetailsUser(null) }}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>تفاصيل المستخدم</DialogTitle>
                  </DialogHeader>
                  {detailsUser && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">الاسم</span>
                        <span className="font-medium">{detailsUser.fullName}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">الهاتف</span>
                        <span>{detailsUser.phone}</span>
                      </div>
                      {detailsUser.whatsapp && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">واتساب</span>
                          <span>{detailsUser.whatsapp}</span>
                        </div>
                      )}
                      {detailsUser.email && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">البريد</span>
                          <span>{detailsUser.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">الدور</span>
                        <span>{ROLE_LABELS[detailsUser.role]}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">الحالة</span>
                        <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", STATUS_BADGE_CLASS[statusForUser(detailsUser)])}>
                          {STATUS_OPTIONS.find((o) => o.value === statusForUser(detailsUser))?.label ?? detailsUser.status}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">تاريخ الانضمام</span>
                        <span>{detailsUser.joinDate}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">آخر نشاط</span>
                        <span>{detailsUser.lastActive}</span>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDetailsUser(null)}>إغلاق</Button>
                    <Button onClick={() => detailsUser && (setDetailsUser(null), openEdit(detailsUser))} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      تعديل
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) { setEditUser(null); setEditError(null) } }}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>تعديل المستخدم</DialogTitle>
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
                      <FieldLabel>الدور</FieldLabel>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as UserRoleType }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        dir="rtl"
                      >
                        <option value="student">طالب</option>
                        <option value="teacher">معلم</option>
                      </select>
                    </FieldGroup>
                    <DialogFooter className="gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditUser(null)} disabled={editLoading}>
                        إلغاء
                      </Button>
                      <Button type="submit" disabled={editLoading}>
                        {editLoading ? "جاري الحفظ..." : "حفظ"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} من {filteredUsers.length}
                  </p>
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage((p) => p - 1) }}
                          className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); setCurrentPage(page) }}
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
                          onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage((p) => p + 1) }}
                          className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardContentCard>
    </div>
  )
}
