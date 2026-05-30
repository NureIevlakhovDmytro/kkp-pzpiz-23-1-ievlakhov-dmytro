import { ErrorCode } from '@app/shared';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      // AppException already carries { code, message, details }
      if (payload && typeof payload === 'object' && 'code' in payload) {
        return res.status(status).json(payload);
      }
      // Built-in HttpException (e.g. ValidationPipe 400, guards 401/403/404)
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: unknown }).message ?? exception.message);
      return res.status(status).json({ code: mapStatusToCode(status), message });
    }

    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ code: ErrorCode.INTERNAL, message: 'Internal server error' });
  }
}

function mapStatusToCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
      return ErrorCode.BUSINESS_RULE;
    default:
      return ErrorCode.INTERNAL;
  }
}
