import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, type ProductInput } from './products.api';

const KEY = ['products'];

export function useProducts() {
  return useQuery({ queryKey: KEY, queryFn: () => productsApi.list() });
}

export function useProductMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });
  return {
    create: useMutation({
      mutationFn: (body: ProductInput) => productsApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (v: { id: string; body: Partial<ProductInput> }) =>
        productsApi.update(v.id, v.body),
      onSuccess: invalidate,
    }),
    archive: useMutation({
      mutationFn: (id: string) => productsApi.archive(id),
      onSuccess: invalidate,
    }),
  };
}
