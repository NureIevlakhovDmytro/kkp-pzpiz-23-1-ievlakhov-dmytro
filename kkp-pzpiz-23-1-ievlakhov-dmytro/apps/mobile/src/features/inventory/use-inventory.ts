import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, type CountEntry, type CreateInventoryInput } from './inventory.api';

export function useInventoryList() {
  return useQuery({ queryKey: ['inventory'], queryFn: () => inventoryApi.list() });
}
export function useInventory(id: string) {
  return useQuery({ queryKey: ['inventory', id], queryFn: () => inventoryApi.get(id) });
}
export function useInventoryReport(id: string, enabled: boolean) {
  return useQuery({ queryKey: ['inventory', id, 'report'], queryFn: () => inventoryApi.report(id), enabled });
}
export function useInventoryMutations(id?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['inventory'] });
    void qc.invalidateQueries({ queryKey: ['stock'] });
  };
  return {
    create: useMutation({ mutationFn: (body: CreateInventoryInput) => inventoryApi.create(body), onSuccess: invalidate }),
    patch: useMutation({ mutationFn: (counts: CountEntry[]) => inventoryApi.patch(id!, counts), onSuccess: invalidate }),
    complete: useMutation({ mutationFn: () => inventoryApi.complete(id!), onSuccess: invalidate }),
  };
}
