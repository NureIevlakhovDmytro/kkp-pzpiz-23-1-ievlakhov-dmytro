export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Locale {
  UK = 'uk',
  EN = 'en',
}

/** Stable application error codes (see spec §0 "Коды ошибок"). */
export enum ErrorCode {
  VALIDATION = 'VALIDATION', // 400
  UNAUTHORIZED = 'UNAUTHORIZED', // 401
  FORBIDDEN = 'FORBIDDEN', // 403
  NOT_FOUND = 'NOT_FOUND', // 404
  CONFLICT = 'CONFLICT', // 409
  BUSINESS_RULE = 'BUSINESS_RULE', // 422
  INTERNAL = 'INTERNAL', // 500
}

/** Fixed write-off reason codes (★ unique part). Seeded, read-only dictionary. */
export enum WriteOffReasonCode {
  SPOILAGE = 'SPOILAGE',
  OVERPRODUCTION = 'OVERPRODUCTION',
  RECEIVING_ERROR = 'RECEIVING_ERROR',
  BREAKAGE = 'BREAKAGE',
  SHORTAGE = 'SHORTAGE',
}

/** Lifecycle of posted operation documents (receipts, transfers, write-offs). */
export enum DocumentStatus {
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

/** Inventory count lifecycle. */
export enum InventoryStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
}

/** Notification kinds (text rendered client-side from payload per locale). */
export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  NEAR_EXPIRY = 'NEAR_EXPIRY',
}

/** Audited user/system actions (НФВ-5). */
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  DOCUMENT_POSTED = 'DOCUMENT_POSTED',
  DOCUMENT_REVERSED = 'DOCUMENT_REVERSED',
  INVENTORY_COMPLETED = 'INVENTORY_COMPLETED',
  REFERENCE_CHANGED = 'REFERENCE_CHANGED',
  USER_CREATED = 'USER_CREATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_ANONYMIZED = 'USER_ANONYMIZED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  PD_EXPORTED = 'PD_EXPORTED',
  PD_ERASED = 'PD_ERASED',
}
