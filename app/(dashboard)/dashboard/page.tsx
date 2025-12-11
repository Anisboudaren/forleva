import { redirect } from 'next/navigation'

// This page redirects to the appropriate dashboard based on user type
// In production, you would check the user's role from your auth system
export default function Dashboard() {
  // TODO: Get user type from authentication context/session
  // For now, defaulting to student dashboard
  // You can implement logic to check user role and redirect accordingly
  
  // Example: Check localStorage or session for user type
  // const userType = getUserType() // 'student' | 'teacher'
  
  redirect('/dashboard/student')
}