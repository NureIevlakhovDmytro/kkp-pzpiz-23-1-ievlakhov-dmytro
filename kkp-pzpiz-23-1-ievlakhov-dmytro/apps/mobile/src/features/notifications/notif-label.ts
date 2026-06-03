import { NotificationType } from '@app/shared';

export type NotifTone = 'danger' | 'warning';

export function notifTone(type: NotificationType): NotifTone {
  return type === NotificationType.LOW_STOCK ? 'danger' : 'warning';
}
