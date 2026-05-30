import { AuditAction } from '@app/shared';

import { deriveAuditAction } from './audit-action';

describe('deriveAuditAction', () => {
  it('maps login/logout', () => {
    expect(deriveAuditAction('POST', '/api/auth/login')).toBe(AuditAction.LOGIN);
    expect(deriveAuditAction('POST', '/api/auth/logout')).toBe(AuditAction.LOGOUT);
  });

  it('maps posting an operation document', () => {
    expect(deriveAuditAction('POST', '/api/receipts')).toBe(AuditAction.DOCUMENT_POSTED);
    expect(deriveAuditAction('POST', '/api/write-offs')).toBe(AuditAction.DOCUMENT_POSTED);
    expect(deriveAuditAction('POST', '/api/transfers')).toBe(AuditAction.DOCUMENT_POSTED);
    expect(deriveAuditAction('POST', '/api/inventory-counts')).toBe(AuditAction.DOCUMENT_POSTED);
  });

  it('maps reverse and complete', () => {
    expect(deriveAuditAction('POST', '/api/write-offs/abc/reverse')).toBe(
      AuditAction.DOCUMENT_REVERSED,
    );
    expect(deriveAuditAction('POST', '/api/inventory-counts/abc/complete')).toBe(
      AuditAction.INVENTORY_COMPLETED,
    );
  });

  it('maps reference mutations', () => {
    expect(deriveAuditAction('POST', '/api/categories')).toBe(AuditAction.REFERENCE_CHANGED);
    expect(deriveAuditAction('PATCH', '/api/products/abc')).toBe(AuditAction.REFERENCE_CHANGED);
    expect(deriveAuditAction('DELETE', '/api/units/abc')).toBe(AuditAction.REFERENCE_CHANGED);
    expect(deriveAuditAction('PATCH', '/api/admin/settings')).toBe(AuditAction.REFERENCE_CHANGED);
  });

  it('returns null for reads and unmapped routes', () => {
    expect(deriveAuditAction('GET', '/api/products')).toBeNull();
    expect(deriveAuditAction('PATCH', '/api/notifications/abc/read')).toBeNull();
    expect(deriveAuditAction('GET', '/api/reports/loss-structure')).toBeNull();
  });

  it('maps admin user management', () => {
    expect(deriveAuditAction('POST', '/api/admin/users')).toBe(AuditAction.USER_CREATED);
    expect(deriveAuditAction('PATCH', '/api/admin/users/abc')).toBe(AuditAction.USER_ROLE_CHANGED);
    expect(deriveAuditAction('DELETE', '/api/admin/users/abc')).toBe(AuditAction.USER_ANONYMIZED);
  });

  it('maps PD self-service', () => {
    expect(deriveAuditAction('GET', '/api/me/export')).toBe(AuditAction.PD_EXPORTED);
    expect(deriveAuditAction('DELETE', '/api/me')).toBe(AuditAction.PD_ERASED);
  });
});
