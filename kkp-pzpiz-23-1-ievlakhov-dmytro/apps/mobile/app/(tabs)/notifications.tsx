import type { NotificationDto } from '@app/shared';
import { NotificationType } from '@app/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { EmptyState, Loading } from '@/components/screen';
import { notifTone } from '@/features/notifications/notif-label';
import { useNotificationMutations, useNotifications } from '@/features/notifications/use-notifications';
import { useLookups } from '@/lib/use-lookups';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, refetch, isRefetching } = useNotifications(unreadOnly);
  const { productName } = useLookups();
  const { markRead, markAllRead } = useNotificationMutations();

  const label = (n: NotificationDto) =>
    n.type === NotificationType.LOW_STOCK ? t('notifications.lowStock') : t('notifications.nearExpiry');

  if (isLoading) return <Loading />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border p-3">
        <View className="flex-row gap-2">
          <Pressable className={`rounded-md px-3 py-1.5 ${unreadOnly ? '' : 'bg-secondary'}`} onPress={() => setUnreadOnly(false)}>
            <Text className="text-foreground">{t('notifications.all')}</Text>
          </Pressable>
          <Pressable className={`rounded-md px-3 py-1.5 ${unreadOnly ? 'bg-secondary' : ''}`} onPress={() => setUnreadOnly(true)}>
            <Text className="text-foreground">{t('notifications.unread')}</Text>
          </Pressable>
        </View>
        <Pressable disabled={markAllRead.isPending} onPress={() => markAllRead.mutate()}>
          <Text className="text-primary">{t('notifications.markAllRead')}</Text>
        </Pressable>
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(n) => n.id}
        renderItem={({ item: n }) => (
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <View className="flex-1 pr-3">
              <Text className={`font-medium ${notifTone(n.type) === 'danger' ? 'text-danger' : 'text-warning'}`}>{label(n)}</Text>
              <Text className="text-xs text-muted-foreground">
                {(n.productId ? (productName[n.productId] ?? '—') : '—')} · {n.createdAt.slice(0, 10)}
              </Text>
            </View>
            {!n.isRead && (
              <Pressable onPress={() => markRead.mutate(n.id)}>
                <Text className="text-primary">{t('notifications.markRead')}</Text>
              </Pressable>
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        ListEmptyComponent={<EmptyState message={t('notifications.empty')} />}
      />
    </View>
  );
}
