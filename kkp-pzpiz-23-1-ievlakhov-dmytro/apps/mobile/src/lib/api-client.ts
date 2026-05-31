import { clearToken, getToken } from './token-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Registered by AuthProvider so a 401 can route back to the login screen. */
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null): void {
  onUnauthorized = fn;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** when true (default), clear the token and fire the unauthorized handler on 401 */
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, auth = true, ...rest } = options;
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && auth) {
    await clearToken();
    onUnauthorized?.();
  }

  const isJson = res.headers.get('Content-Type')?.includes('application/json');
  const payload: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err = (payload ?? {}) as { code?: string; message?: string; details?: unknown };
    throw new ApiError(err.code ?? 'INTERNAL', err.message ?? `HTTP ${res.status}`, res.status, err.details);
  }
  return payload as T;
}
