export const AUDIT_ACTIONS = {
  ORDER_CONFIRM: 'order.confirm',
  ORDER_CANCEL: 'order.cancel',
  ORDER_UPDATE_NOTES: 'order.update_notes',
  REVIEW_DELETION_REQUEST: 'review.deletion_request',
  REVIEW_DELETION_APPROVE: 'review.deletion_approve',
  REVIEW_DELETION_REJECT: 'review.deletion_reject',
  COURSE_APPROVE: 'course.approve',
  COURSE_REJECT: 'course.reject',
  COURSE_SUSPEND: 'course.suspend',
  USER_STATUS_CHANGE: 'user.status_change',
  ADMIN_CREATE: 'admin.create',
  ADMIN_UPDATE: 'admin.update',
} as const

export type AuditActionCode = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]

export const AUDIT_ACTION_LABELS: Record<AuditActionCode, string> = {
  [AUDIT_ACTIONS.ORDER_CONFIRM]: 'تأكيد طلب',
  [AUDIT_ACTIONS.ORDER_CANCEL]: 'إلغاء طلب',
  [AUDIT_ACTIONS.ORDER_UPDATE_NOTES]: 'تحديث ملاحظات الطلب',
  [AUDIT_ACTIONS.REVIEW_DELETION_REQUEST]: 'طلب حذف تقييم',
  [AUDIT_ACTIONS.REVIEW_DELETION_APPROVE]: 'الموافقة على حذف تقييم',
  [AUDIT_ACTIONS.REVIEW_DELETION_REJECT]: 'رفض طلب حذف تقييم',
  [AUDIT_ACTIONS.COURSE_APPROVE]: 'الموافقة على دورة',
  [AUDIT_ACTIONS.COURSE_REJECT]: 'رفض دورة',
  [AUDIT_ACTIONS.COURSE_SUSPEND]: 'تعليق دورة',
  [AUDIT_ACTIONS.USER_STATUS_CHANGE]: 'تغيير حالة مستخدم',
  [AUDIT_ACTIONS.ADMIN_CREATE]: 'إنشاء مسؤول جديد',
  [AUDIT_ACTIONS.ADMIN_UPDATE]: 'تحديث بيانات مسؤول',
}

