import { ApiError, apiFetch, setUnauthorizedHandler } from './api-client';
import * as tokenStore from './token-store';

jest.mock('./token-store');
const mockedToken = tokenStore as jest.Mocked<typeof tokenStore>;

function mockRes(body: unknown, status: number) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedToken.getToken.mockResolvedValue(null);
});

describe('apiFetch', () => {
  it('attaches the Bearer token from the async store', async () => {
    mockedToken.getToken.mockResolvedValue('tok123');
    const fetchMock = jest.fn().mockResolvedValue(mockRes({ ok: true }, 200));
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiFetch('/test');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok123' }),
      }),
    );
  });

  it('throws ApiError carrying the server code on non-ok', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockRes({ code: 'BAD', message: 'nope' }, 400)) as unknown as typeof fetch;
    await expect(apiFetch('/test')).rejects.toMatchObject({ code: 'BAD', status: 400 });
    await expect(apiFetch('/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('clears the token and calls the unauthorized handler on 401', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    global.fetch = jest.fn().mockResolvedValue(mockRes({ code: 'UNAUTHORIZED' }, 401)) as unknown as typeof fetch;

    await expect(apiFetch('/test')).rejects.toBeInstanceOf(ApiError);
    expect(mockedToken.clearToken).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
    setUnauthorizedHandler(null);
  });
});
