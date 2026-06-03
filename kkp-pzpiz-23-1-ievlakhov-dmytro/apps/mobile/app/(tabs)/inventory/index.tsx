import type { InventoryCountDto } from '@app/shared';
import { InventoryStatus } from '@app/shared';
import { Link, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { EmptyState, Loading } from '@/components/screen';
import { useInventoryList } from '@/features/inventory/use-inventory';
import { useLookups } from '@/lib/use-lookups';

export default function InventoryList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useInventoryList();
  const { locationName } = useLookups();

  if (isLoading) return <Loading />;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerRight: () => (
        <Link href="/(tabs)/inventory/new" asChild>
          <Pressable><Text className="text-primary text-base">＋</Text></Pressable>
        </Link>
      ) }} />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(c) => c.id}
        renderItem={({ item }: { item: InventoryCountDto }) => {
          const completed = item.status === InventoryStatus.COMPLETED;
          return (
            <Pressable
              className="flex-row items-center justify-between border-b border-border px-4 py-3"
              onPress={() => router.push(`/(tabs)/inventory/${item.id}`)}
            >
              <View className="flex-1 pr-3">
                <Text className="font-medium text-foreground">{item.number}</Text>
                <Text className="text-xs text-muted-foreground">
                  {item.date.slice(0, 10)} · {locationName[item.locationId] ?? '—'}
                </Text>
              </View>
              <View className={`self-start rounded-full px-2.5 py-0.5 ${completed ? 'bg-primary/15' : 'bg-warning/15'}`}>
                <Text className={`text-xs font-medium ${completed ? 'text-primary' : 'text-warning'}`}>
                  {completed ? t('inventory.completed') : t('inventory.draft')}
                </Text>
              </View>
            </Pressable>
          );
        }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}
