import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth-session'
import { AdminDashboardLayout } from '@/components/admin-dashboard-layout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }
  if (session.role === 'TEACHER') {
    redirect('/dashboard/teacher')
  }
  return (
    <AdminDashboardLayout email={session.email} role={session.role}>
      {children}
    </AdminDashboardLayout>
  )
}
