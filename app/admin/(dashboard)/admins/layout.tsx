import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth-session'

export default async function AdminsSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }
  return <>{children}</>
}
