import type { NotificationDto, Paginated } from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export const notificationsApi = {
  list: (unreadOnly: boolean) =>
    apiFetch<Paginated<NotificationDto>>(`/notifications?page=1&limit=100${unreadOnly ? '&isRead=false' : ''}`),
  markRead: (id: string) => apiFetch<NotificationDto>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch<{ updated: number }>('/notifications/read-all', { method: 'PATCH' }),
};
