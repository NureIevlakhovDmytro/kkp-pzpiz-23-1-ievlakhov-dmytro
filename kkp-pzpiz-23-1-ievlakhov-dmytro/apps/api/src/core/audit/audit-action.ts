import { AuditAction } from '@app/shared';

const OPERATION = /\/(receipts|write-offs|transfers|inventory-counts)$/;
const REFERENCE =
  /\/(categories|units|suppliers|storage-locations|products|currencies|exchange-rates)(\/[^/]+)?$/;

/** Map an HTTP mutation to a semantic audit action, or null if it should not be audited. Pure. */
export function deriveAuditAction(method: string, path: string): AuditAction | null {
  if (method === 'POST' && path.endsWith('/auth/login')) return AuditAction.LOGIN;
  if (method === 'POST' && path.endsWith('/auth/logout')) return AuditAction.LOGOUT;
  if (method === 'POST' && path.endsWith('/complete')) return AuditAction.INVENTORY_COMPLETED;
  if (method === 'POST' && path.endsWith('/reverse')) return AuditAction.DOCUMENT_REVERSED;
  if (method === 'POST' && path.endsWith('/admin/users')) return AuditAction.USER_CREATED;
  if (method === 'PATCH' && /\/admin\/users\/[^/]+$/.test(path))
    return AuditAction.USER_ROLE_CHANGED;
  if (method === 'DELETE' && /\/admin\/users\/[^/]+$/.test(path))
    return AuditAction.USER_ANONYMIZED;
  if (method === 'GET' && path.endsWith('/me/export')) return AuditAction.PD_EXPORTED;
  if (method === 'DELETE' && path.endsWith('/me')) return AuditAction.PD_ERASED;
  if (method === 'POST' && OPERATION.test(path)) return AuditAction.DOCUMENT_POSTED;
  if (
    (method === 'POST' || method === 'PATCH' || method === 'DELETE') &&
    (REFERENCE.test(path) || path.endsWith('/admin/settings'))
  ) {
    return AuditAction.REFERENCE_CHANGED;
  }
  return null;
}
