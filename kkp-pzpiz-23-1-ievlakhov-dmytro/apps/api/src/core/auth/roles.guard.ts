import { Role } from '@app/shared';
import { ErrorCode } from '@app/shared';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AppException } from '../common/api-exception';
import { IS_PUBLIC_KEY, JwtUser, ROLES_KEY } from './decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    // No @Roles => any authenticated user may pass (route is still JWT-protected).
    if (!required || required.length === 0) return true;

    const user = ctx.switchToHttp().getRequest<{ user?: JwtUser }>().user;
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED, 'Not authenticated');
    if (!required.includes(user.role))
      throw new AppException(ErrorCode.FORBIDDEN, 'Insufficient role');
    return true;
  }
}
