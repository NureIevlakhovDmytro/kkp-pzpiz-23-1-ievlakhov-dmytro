import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transfersApi, type TransferInput } from './transfers.api';

const KEY = ['transfers'];

export function useTransfers() {
  return useQuery({ queryKey: KEY, queryFn: () => transfersApi.list() });
}
export function useTransferMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: KEY });
    void qc.invalidateQueries({ queryKey: ['stock'] });
    void qc.invalidateQueries({ queryKey: ['batches'] });
  };
  return {
    post: useMutation({ mutationFn: (v: { body: TransferInput; key: string }) => transfersApi.post(v.body, v.key), onSuccess: invalidate }),
    reverse: useMutation({ mutationFn: (id: string) => transfersApi.reverse(id), onSuccess: invalidate }),
  };
}
