import { getToken, clearToken } from './token-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** when true (default), redirect to /login on 401 */
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, auth = true, ...rest } = options;
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && auth && typeof window !== 'undefined') {
    clearToken();
    if (window.location.pathname !== '/login') window.location.assign('/login');
  }

  const isJson = res.headers.get('Content-Type')?.includes('application/json');
  const payload: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err = (payload ?? {}) as { code?: string; message?: string; details?: unknown };
    throw new ApiError(err.code ?? 'INTERNAL', err.message ?? res.statusText, res.status, err.details);
  }
  return payload as T;
}
