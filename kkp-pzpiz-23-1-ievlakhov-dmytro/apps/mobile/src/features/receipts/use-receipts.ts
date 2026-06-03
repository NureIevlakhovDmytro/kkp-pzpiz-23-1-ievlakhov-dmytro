import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { receiptsApi, type ReceiptInput } from './receipts.api';

const KEY = ['receipts'];

export function useReceipts() {
  return useQuery({ queryKey: KEY, queryFn: () => receiptsApi.list() });
}
export function useReceipt(id: string) {
  return useQuery({ queryKey: ['receipts', id], queryFn: () => receiptsApi.get(id) });
}
export function useReceiptMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['receipts'] });
    void qc.invalidateQueries({ queryKey: ['stock'] });
    void qc.invalidateQueries({ queryKey: ['lookup', 'batches'] });
  };
  return {
    post: useMutation({ mutationFn: (v: { body: ReceiptInput; key: string }) => receiptsApi.post(v.body, v.key), onSuccess: invalidate }),
    reverse: useMutation({ mutationFn: (id: string) => receiptsApi.reverse(id), onSuccess: invalidate }),
  };
}
