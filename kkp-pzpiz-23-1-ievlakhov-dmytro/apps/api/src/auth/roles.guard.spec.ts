import { Role } from '@app/shared';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { AppException } from '../common/api-exception';
import { RolesGuard } from './roles.guard';

function ctxWith(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows ADMIN when ADMIN required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce([Role.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctxWith({ id: '1', email: 'a', role: Role.ADMIN }))).toBe(true);
  });

  it('forbids USER when ADMIN required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce([Role.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(ctxWith({ id: '1', email: 'u', role: Role.USER }))).toThrow(
      AppException,
    );
  });

  it('allows any authenticated user when no @Roles set', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctxWith({ id: '1', email: 'u', role: Role.USER }))).toBe(true);
  });
});
