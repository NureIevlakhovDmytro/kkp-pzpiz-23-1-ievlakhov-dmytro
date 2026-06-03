import type { ReceiptDto } from '@app/shared';
import { Link, Stack, useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { DocStatusBadge } from '@/components/doc-status-badge';
import { EmptyState, Loading } from '@/components/screen';
import { useReceipts } from '@/features/receipts/use-receipts';
import { useLookups } from '@/lib/use-lookups';

export default function ReceiptsList() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useReceipts();
  const { supplierName, locationName } = useLookups();

  if (isLoading) return <Loading />;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerRight: () => (
        <Link href="/(tabs)/operations/receipts/new" asChild>
          <Pressable><Text className="text-primary text-base">＋</Text></Pressable>
        </Link>
      ) }} />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(r) => r.id}
        renderItem={({ item }: { item: ReceiptDto }) => (
          <Pressable
            className="flex-row items-center justify-between border-b border-border px-4 py-3"
            onPress={() => router.push(`/(tabs)/operations/receipts/${item.id}`)}
          >
            <View className="flex-1 pr-3">
              <Text className="font-medium text-foreground">{item.number}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.date.slice(0, 10)} · {item.supplierId ? (supplierName[item.supplierId] ?? '—') : '—'} · {locationName[item.locationId] ?? '—'}
              </Text>
            </View>
            <DocStatusBadge status={item.status} />
          </Pressable>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}
