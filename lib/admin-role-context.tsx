'use client'

import { createContext, useContext } from 'react'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER'

const AdminRoleContext = createContext<AdminRole | null>(null)

export function AdminRoleProvider({
  role,
  children,
}: {
  role: AdminRole
  children: React.ReactNode
}) {
  return (
    <AdminRoleContext.Provider value={role}>
      {children}
    </AdminRoleContext.Provider>
  )
}

export function useAdminRole(): AdminRole | null {
  return useContext(AdminRoleContext)
}

/** True only for Super Admin (can create other admins). */
export function useCanCreateAdmins(): boolean {
  return useAdminRole() === 'SUPER_ADMIN'
}
