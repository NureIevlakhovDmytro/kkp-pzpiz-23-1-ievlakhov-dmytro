'use client';
import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NotificationDto } from '@app/shared';
import { NotificationType } from '@app/shared';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { useLookups } from '@/lib/use-lookups';
import { useNotifications, useNotificationMutations } from './use-notifications';

export function NotificationsPage() {
  const { t } = useTranslation();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading } = useNotifications(unreadOnly);
  const { productName } = useLookups();
  const { markRead, markAllRead } = useNotificationMutations();

  const typeLabel = (n: NotificationDto) =>
    n.type === NotificationType.LOW_STOCK ? t('notifications.lowStock') : t('notifications.nearExpiry');
  const columns: Column<NotificationDto>[] = [
    {
      key: 'type',
      header: t('notifications.type'),
      cell: (n) => (
        <StatusBadge tone={n.type === NotificationType.LOW_STOCK ? 'danger' : 'warning'}>
          {typeLabel(n)}
        </StatusBadge>
      ),
    },
    {
      key: 'product',
      header: t('notifications.product'),
      cell: (n) => (n.productId ? (productName[n.productId] ?? '—') : '—'),
    },
    {
      key: 'created',
      header: t('notifications.created'),
      cell: (n) => <span className="nums">{n.createdAt.slice(0, 10)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (n) =>
        n.isRead ? null : (
          <Button variant="ghost" size="sm" onClick={() => markRead.mutate(n.id)}>
            {t('notifications.markRead')}
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('notifications.title')}
        description={t('notifications.subtitle')}
        actions={
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {t('notifications.markAllRead')}
          </Button>
        }
      />
      <div className="mb-3 flex gap-2">
        <Button
          variant={unreadOnly ? 'ghost' : 'secondary'}
          size="sm"
          onClick={() => setUnreadOnly(false)}
        >
          {t('notifications.all')}
        </Button>
        <Button
          variant={unreadOnly ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setUnreadOnly(true)}
        >
          {t('notifications.unread')}
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        loading={isLoading}
        empty={t('notifications.empty')}
      />
    </>
  );
}
