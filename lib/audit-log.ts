import { prisma } from '@/lib/db'
import type { AuditActorRole } from '@prisma/client'
import type { AuditActionCode } from '@/lib/audit-actions'

type CreateAuditLogArgs = {
  actorId: string
  actorRole: AuditActorRole
  action: AuditActionCode | string
  entityType: string
  entityId?: string | null
  meta?: Record<string, unknown>
}

export async function createAuditLog({
  actorId,
  actorRole,
  action,
  entityType,
  entityId,
  meta,
}: CreateAuditLogArgs) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action,
        entityType,
        entityId: entityId ?? null,
        meta: meta ?? undefined,
      },
    })
  } catch (e) {
    console.error('Failed to create audit log', e)
  }
}

