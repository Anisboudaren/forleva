import { getUsersListForAdmin } from "@/lib/admin-users"
import { AdminUsersPageClient } from "./admin-users-client"

export default async function AdminUsersPage() {
  const initialUsers = await getUsersListForAdmin()
  return <AdminUsersPageClient initialUsers={initialUsers} />
}
