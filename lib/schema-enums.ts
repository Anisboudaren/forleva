/**
 * Schema enum values as string literal types.
 * Use these instead of importing from @prisma/client when the generated client
 * does not export enums (e.g. in some build environments).
 */

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED"

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT"

export type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "BLOCKED"

export type ContentType =
  | "VIDEO"
  | "QUIZ"
  | "EXTERNAL"
  | "PDF"
  | "SURVEY"
  | "TITLE"
  | "CERTIFICATE"
  | "EXERCISE"
  | "AUDIO"
  | "CHECKLIST"
  | "DOCUMENT"
  | "IMAGE"
