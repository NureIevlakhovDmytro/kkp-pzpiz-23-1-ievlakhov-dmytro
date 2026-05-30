import { AuditAction } from '@app/shared';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, from, mergeMap, Observable, of, throwError } from 'rxjs';

import { JwtUser } from '../auth/decorators';
import { AuditService } from './audit.service';
import { deriveAuditAction } from './audit-action';

interface AuditableRequest {
  method: string;
  originalUrl?: string;
  url: string;
  user?: JwtUser;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<AuditableRequest>();
    const method = req.method;
    const path = (req.originalUrl ?? req.url).split('?')[0];

    return next.handle().pipe(
      mergeMap((response: unknown) => {
        const action = deriveAuditAction(method, path);
        if (!action) return of(response);
        return from(
          this.audit.record({
            userId: req.user?.id ?? null,
            action,
            entity: this.resourceOf(path),
            entityId: this.entityIdOf(response, req),
            details: { method, path },
          }),
        ).pipe(mergeMap(() => of(response)));
      }),
      catchError((err: unknown) => {
        if (method === 'POST' && path.endsWith('/auth/login')) {
          const email = typeof req.body?.email === 'string' ? req.body.email : undefined;
          void this.audit.record({
            userId: null,
            action: AuditAction.LOGIN_FAILED,
            entity: 'auth',
            entityId: null,
            details: { email },
          });
        }
        return throwError(() => err);
      }),
    );
  }

  private resourceOf(path: string): string | null {
    const parts = path.split('/').filter(Boolean); // ['api','receipts',...]
    return parts[1] ?? null;
  }

  private entityIdOf(response: unknown, req: AuditableRequest): string | null {
    if (
      response &&
      typeof response === 'object' &&
      'id' in response &&
      typeof (response as Record<string, unknown>).id === 'string'
    ) {
      return (response as Record<string, string>).id;
    }
    return req.params?.id ?? null;
  }
}
