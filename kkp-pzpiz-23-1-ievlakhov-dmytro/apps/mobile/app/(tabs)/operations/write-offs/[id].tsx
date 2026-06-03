import { DocumentStatus } from '@app/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { DocStatusBadge } from '@/components/doc-status-badge';
import { ReverseButton } from '@/components/reverse-button';
import { Loading } from '@/components/screen';
import { useWriteOff, useWriteOffMutations, useWriteOffReasons } from '@/features/write-offs/use-write-offs';
import { formatQty } from '@/lib/format';
import { useBatchLabels } from '@/lib/use-batches';
import { useLookups } from '@/lib/use-lookups';

export default function WriteOffDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: w, isLoading } = useWriteOff(id);
  const { reverse } = useWriteOffMutations();
  const { data: reasons } = useWriteOffReasons();
  const { batchLabel } = useBatchLabels();
  const { locationName } = useLookups();

  if (isLoading || !w) return <Loading />;
  const posted = w.status === DocumentStatus.POSTED;
  const reasonName = (reasons ?? []).find((r) => r.id === w.reasonId)?.nameUk ?? '—';

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-foreground">{w.number}</Text>
        <DocStatusBadge status={w.status} />
      </View>
      <Text className="text-muted-foreground">{w.date.slice(0, 10)} · {reasonName}</Text>
      {w.comment ? <Text className="mb-3 mt-1 text-foreground">{w.comment}</Text> : <View className="mb-3" />}

      {w.lines.map((l) => (
        <View key={l.id} className="mb-2 rounded-md border border-border bg-card p-3">
          <Text className="font-medium text-foreground">{batchLabel[l.batchId] ?? l.batchId}</Text>
          <Text className="text-xs text-muted-foreground">{locationName[l.locationId] ?? l.locationId}</Text>
          <Text className="text-sm text-foreground">{formatQty(l.quantity)}</Text>
        </View>
      ))}

      {posted && (
        <View className="mt-4">
          <ReverseButton
            confirmMessage={t('writeOffs.reverseConfirm')}
            disabled={reverse.isPending}
            onConfirm={() => reverse.mutate(w.id, { onSuccess: () => router.back() })}
          />
        </View>
      )}
    </ScrollView>
  );
}
