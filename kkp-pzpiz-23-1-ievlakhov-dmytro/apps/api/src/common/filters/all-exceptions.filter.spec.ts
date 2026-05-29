import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppException } from '../api-exception';
import { ErrorCode } from '@app/shared';
import { NotFoundException, ArgumentsHost } from '@nestjs/common';

function hostWithResponse() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('serializes AppException as {code,message,details}', () => {
    const { host, status, json } = hostWithResponse();
    filter.catch(new AppException(ErrorCode.CONFLICT, 'dup', { field: 'sku' }), host);
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ code: ErrorCode.CONFLICT, message: 'dup', details: { field: 'sku' } });
  });

  it('maps built-in NotFoundException to NOT_FOUND code', () => {
    const { host, status, json } = hostWithResponse();
    filter.catch(new NotFoundException('missing'), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ code: ErrorCode.NOT_FOUND, message: 'missing' });
  });
});
