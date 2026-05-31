import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { writeOffsApi, type WriteOffInput } from './write-offs.api';

const KEY = ['write-offs'];

export function useWriteOffs() {
  return useQuery({ queryKey: KEY, queryFn: () => writeOffsApi.list() });
}
export function useWriteOffReasons() {
  return useQuery({ queryKey: ['write-off-reasons'], queryFn: () => writeOffsApi.reasons() });
}
export function useWriteOffMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: KEY });
    void qc.invalidateQueries({ queryKey: ['stock'] });
  };
  return {
    post: useMutation({ mutationFn: (v: { body: WriteOffInput; key: string }) => writeOffsApi.post(v.body, v.key), onSuccess: invalidate }),
    reverse: useMutation({ mutationFn: (id: string) => writeOffsApi.reverse(id), onSuccess: invalidate }),
  };
}
