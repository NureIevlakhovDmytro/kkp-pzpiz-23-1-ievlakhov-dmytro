import type { WriteOffDto } from '@app/shared';
import { Link, Stack, useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { DocStatusBadge } from '@/components/doc-status-badge';
import { EmptyState, Loading } from '@/components/screen';
import { useWriteOffReasons, useWriteOffs } from '@/features/write-offs/use-write-offs';

export default function WriteOffsList() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useWriteOffs();
  const { data: reasons } = useWriteOffReasons();
  const reasonName = Object.fromEntries((reasons ?? []).map((r) => [r.id, r.nameUk]));

  if (isLoading) return <Loading />;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerRight: () => (
        <Link href="/(tabs)/operations/write-offs/new" asChild>
          <Pressable><Text className="text-primary text-base">＋</Text></Pressable>
        </Link>
      ) }} />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(w) => w.id}
        renderItem={({ item }: { item: WriteOffDto }) => (
          <Pressable
            className="flex-row items-center justify-between border-b border-border px-4 py-3"
            onPress={() => router.push(`/(tabs)/operations/write-offs/${item.id}`)}
          >
            <View className="flex-1 pr-3">
              <Text className="font-medium text-foreground">{item.number}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.date.slice(0, 10)} · {reasonName[item.reasonId] ?? '—'}
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
