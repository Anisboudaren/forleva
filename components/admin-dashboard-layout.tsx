'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  User,
  Shield,
  UserCog,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DashboardFooter } from "@/components/dashboard-footer/DashboardFooter"
import { cn } from "@/lib/utils"
import { AdminRoleProvider, type AdminRole } from "@/lib/admin-role-context"

const adminMenuItems = [
  { title: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
  { title: "المستخدمين", icon: Users, href: "/admin/users" },
  { title: "المسؤولون", icon: UserCog, href: "/admin/admins", superAdminOnly: true },
  { title: "الدورات", icon: BookOpen, href: "/admin/courses" },
  { title: "الطلبات", icon: ShoppingBag, href: "/admin/orders" },
  { title: "الإعدادات", icon: Settings, href: "/admin/settings" },
]

function MenuItemLink({ item, isActive }: { item: typeof adminMenuItems[0], isActive: boolean }) {
  const { setOpenMobile, isMobile } = useSidebar()
  const handleClick = () => {
    if (isMobile) setOpenMobile(false)
  }
  return (
    <Link href={item.href} onClick={handleClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200", "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3")}>
      <item.icon className={cn("h-5 w-5 transition-colors flex-shrink-0", isActive ? "text-amber-600" : "text-gray-400 group-hover/menu-button:text-gray-600")} />
      <span className={cn("text-sm font-medium transition-colors group-data-[collapsible=icon]:hidden", isActive ? "text-gray-900" : "text-gray-600 group-hover/menu-button:text-gray-900")}>{item.title}</span>
      {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-full group-data-[collapsible=icon]:hidden" />}
    </Link>
  )
}

export function AdminDashboardLayout({
  children,
  email,
  role,
}: {
  children: React.ReactNode
  email?: string | null
  role: AdminRole
}) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/admin/login'
  }

  return (
    <AdminRoleProvider role={role}>
    <SidebarProvider>
      <Sidebar side="right" variant="sidebar" collapsible="icon" className="bg-white border-l border-gray-100">
        <SidebarHeader className="border-b border-gray-100">
          <div className="px-6 py-5 group-data-[collapsible=icon]:px-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <h2 className="text-base font-bold text-gray-900 leading-tight whitespace-nowrap truncate">لوحة الإدارة</h2>
                <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap truncate">إدارة المنصة</p>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col px-3 py-6">
          <SidebarMenu className="space-y-1 flex-1">
            {adminMenuItems
              .filter((item) => !('superAdminOnly' in item && item.superAdminOnly) || role === 'SUPER_ADMIN')
              .map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} className={cn("group/menu-button relative w-full rounded-xl transition-all duration-200", "hover:bg-gray-50", isActive && "bg-gray-50", "[&>span]:whitespace-nowrap [&>span]:truncate")}>
                    <MenuItemLink item={item} isActive={isActive} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
          <div className="mt-auto border-t border-gray-100 pt-4 group-data-[collapsible=icon]:hidden">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">المسؤول</p>
                  <p className="text-xs text-gray-500 truncate">{email || '—'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200", "text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                <LogOut className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
    </AdminRoleProvider>
  )
}
