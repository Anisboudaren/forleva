import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/user-session'

// Redirect to the right dashboard based on signed session cookie.
export default async function Dashboard() {
  const session = await getUserSession()
  if (!session) {
    redirect('/login')
  }
  if (session.role === 'TEACHER') {
    redirect('/dashboard/teacher')
  }
  redirect('/dashboard/student')
}