import { NotificationType } from '@app/shared';
import { notifTone } from './notif-label';

describe('notifTone', () => {
  it('returns danger for low stock', () => {
    expect(notifTone(NotificationType.LOW_STOCK)).toBe('danger');
  });
  it('returns warning for near expiry', () => {
    expect(notifTone(NotificationType.NEAR_EXPIRY)).toBe('warning');
  });
});
