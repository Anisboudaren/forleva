import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const USER_COOKIE = "forleva_user_session"
const ADMIN_COOKIE = "forleva_admin_session"

function decodeRoleFromSignedCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null
  const dot = cookieValue.lastIndexOf(".")
  if (dot <= 0) return null
  const payloadBase64 = cookieValue.slice(0, dot)
  try {
    const b64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4)
    const json = JSON.parse(atob(padded)) as {
      role?: string
    }
    return typeof json.role === "string" ? json.role : null
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Student/teacher dashboard pages
  if (pathname.startsWith("/dashboard")) {
    const userRole = decodeRoleFromSignedCookie(req.cookies.get(USER_COOKIE)?.value)
    const adminRole = decodeRoleFromSignedCookie(req.cookies.get(ADMIN_COOKIE)?.value)

    if (!userRole && !adminRole) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Keep teacher pages teacher-only
    if (pathname.startsWith("/dashboard/teacher") && userRole !== "TEACHER" && adminRole !== "TEACHER") {
      return NextResponse.redirect(new URL("/dashboard/student", req.url))
    }

    // Keep student pages student-only
    if (pathname.startsWith("/dashboard/student") && userRole !== "STUDENT") {
      if (userRole === "TEACHER" || adminRole === "TEACHER") {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Admin pages
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminRole = decodeRoleFromSignedCookie(req.cookies.get(ADMIN_COOKIE)?.value)
    if (!adminRole) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    if (adminRole === "TEACHER") {
      return NextResponse.redirect(new URL("/dashboard/teacher", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
