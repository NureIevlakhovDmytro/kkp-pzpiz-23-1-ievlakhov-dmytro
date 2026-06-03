import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './notifications.api';

export function useNotifications(unreadOnly: boolean) {
  return useQuery({ queryKey: ['notifications', unreadOnly], queryFn: () => notificationsApi.list(unreadOnly) });
}

export function useNotificationMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['notifications'] });
  return {
    markRead: useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: invalidate }),
    markAllRead: useMutation({ mutationFn: () => notificationsApi.markAllRead(), onSuccess: invalidate }),
  };
}
