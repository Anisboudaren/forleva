import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/user-session'
import DashboardLayoutClient from '@/components/dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getUserSession()
  if (!session) {
    redirect('/login')
  }
  return (
    <DashboardLayoutClient email={session.email}>
      {children}
    </DashboardLayoutClient>
  )
}
