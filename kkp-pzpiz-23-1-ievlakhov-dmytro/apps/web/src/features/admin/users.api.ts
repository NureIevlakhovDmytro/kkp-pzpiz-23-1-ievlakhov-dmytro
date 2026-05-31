import type { Paginated, Role, Locale, UserDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export interface CreateUserInput {
  email: string;
  fullName: string;
  password: string;
  role: Role;
  locale?: Locale;
}
export interface UpdateUserInput {
  fullName?: string;
  role?: Role;
  locale?: Locale;
  isActive?: boolean;
}

export const usersApi = {
  list: () => apiFetch<Paginated<UserDto>>(`/admin/users${listQuery()}`),
  create: (body: CreateUserInput) =>
    apiFetch<UserDto>('/admin/users', { method: 'POST', body }),
  update: (id: string, body: UpdateUserInput) =>
    apiFetch<UserDto>(`/admin/users/${id}`, { method: 'PATCH', body }),
  anonymize: (id: string) =>
    apiFetch<{ status: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
};
