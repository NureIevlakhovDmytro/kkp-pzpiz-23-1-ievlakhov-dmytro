import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Paginated } from '@app/shared';
import { apiFetch } from './api-client';

export function crudPaths(resource: string) {
  return {
    list: `/${resource}?page=1&limit=200`,
    one: (id: string) => `/${resource}/${id}`,
  };
}

export function useCrud<T extends { id: string }, Input>(resource: string) {
  const qc = useQueryClient();
  const key = ['crud', resource];
  const paths = crudPaths(resource);
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const list = useQuery({
    queryKey: key,
    queryFn: () => apiFetch<Paginated<T>>(paths.list),
  });

  const create = useMutation({
    mutationFn: (body: Input) =>
      apiFetch<T>(`/${resource}`, { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (v: { id: string; body: Partial<Input> }) =>
      apiFetch<T>(paths.one(v.id), { method: 'PATCH', body: v.body }),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ status: string }>(paths.one(id), { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { list, create, update, archive };
}
