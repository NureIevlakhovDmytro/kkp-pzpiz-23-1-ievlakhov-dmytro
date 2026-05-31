import type { NotificationDto, Paginated } from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export const notificationsApi = {
  list: (unreadOnly: boolean) =>
    apiFetch<Paginated<NotificationDto>>(
      `/notifications${listQuery(unreadOnly ? { isRead: 'false' } : undefined)}`,
    ),
  markRead: (id: string) => apiFetch<NotificationDto>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch<{ updated: number }>('/notifications/read-all', { method: 'PATCH' }),
};
