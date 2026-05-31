import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type CreateUserInput,
  type UpdateUserInput,
} from './users.api';

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.list(),
  });
}
export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ['admin-users'] });
  return {
    create: useMutation({
      mutationFn: (body: CreateUserInput) => usersApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (v: { id: string; body: UpdateUserInput }) =>
        usersApi.update(v.id, v.body),
      onSuccess: invalidate,
    }),
    anonymize: useMutation({
      mutationFn: (id: string) => usersApi.anonymize(id),
      onSuccess: invalidate,
    }),
  };
}
