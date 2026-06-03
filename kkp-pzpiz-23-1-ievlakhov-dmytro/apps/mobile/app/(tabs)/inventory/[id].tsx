import { InventoryStatus } from '@app/shared';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Loading } from '@/components/screen';
import { discrepancy } from '@/features/inventory/discrepancy';
import { useInventory, useInventoryMutations, useInventoryReport } from '@/features/inventory/use-inventory';
import { formatQty } from '@/lib/format';
import { useBatchLabels } from '@/lib/use-batches';

export default function InventoryCountSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { batchLabel } = useBatchLabels();
  const { data: inv, isLoading } = useInventory(id);
  const completed = inv?.status === InventoryStatus.COMPLETED;
  const { patch, complete } = useInventoryMutations(id);
  const { data: report } = useInventoryReport(id, !!completed);
  const [seededId, setSeededId] = useState<string | null>(null);
  const [actuals, setActuals] = useState<Record<string, string>>({});

  if (inv && seededId !== inv.id) {
    setSeededId(inv.id);
    setActuals(Object.fromEntries(inv.lines.map((l) => [l.batchId, l.actualQty === null ? '' : String(l.actualQty)])));
  }

  if (isLoading || !inv) return <Loading />;
  const draft = inv.status === InventoryStatus.DRAFT;

  async function save() {
    const counts = inv!.lines
      .filter((l) => actuals[l.batchId] !== '' && actuals[l.batchId] !== undefined)
      .map((l) => ({ batchId: l.batchId, actualQty: Number(actuals[l.batchId]) }));
    try {
      await patch.mutateAsync(counts);
      Alert.alert(t('common.save'));
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : 'Error');
    }
  }

  function askComplete() {
    Alert.alert(t('inventory.complete'), t('inventory.completeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('inventory.complete'),
        style: 'destructive',
        onPress: () => {
          complete.mutateAsync()
            .then(() => Alert.alert(t('inventory.completed')))
            .catch((e: unknown) => Alert.alert(e instanceof Error ? e.message : 'Error'));
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-foreground">{inv.number}</Text>
        <View className={`self-start rounded-full px-2.5 py-0.5 ${completed ? 'bg-primary/15' : 'bg-warning/15'}`}>
          <Text className={`text-xs font-medium ${completed ? 'text-primary' : 'text-warning'}`}>
            {completed ? t('inventory.completed') : t('inventory.draft')}
          </Text>
        </View>
      </View>

      {completed && report && (
        <View className="mb-4 flex-row flex-wrap gap-2 rounded-md border border-border bg-card p-3">
          <Text className="text-danger">{t('inventory.shortages')}: {report.shortageCount} · {formatQty(report.shortageTotalBase)}</Text>
          <Text className="text-info">{t('inventory.surpluses')}: {report.surplusCount} · {formatQty(report.surplusTotalBase)}</Text>
          {report.rateMissing && <Text className="text-warning">{t('reports.rateMissing')}</Text>}
        </View>
      )}

      <View className="flex-row border-b border-border pb-2">
        <Text className="flex-1 text-xs text-muted-foreground">{t('writeOffs.batch')}</Text>
        <Text className="w-16 text-right text-xs text-muted-foreground">{t('inventory.expected')}</Text>
        <Text className="w-24 text-right text-xs text-muted-foreground">{t('inventory.actual')}</Text>
        <Text className="w-16 text-right text-xs text-muted-foreground">{t('inventory.discrepancy')}</Text>
      </View>

      {inv.lines.map((l) => {
        const actual = actuals[l.batchId];
        const disc = discrepancy(actual, l.expectedQty);
        const discColor = disc != null && disc < 0 ? 'text-danger' : disc != null && disc > 0 ? 'text-info' : 'text-foreground';
        return (
          <View key={l.id} className="flex-row items-center border-b border-border/60 py-2">
            <Text className="flex-1 pr-2 text-foreground">{batchLabel[l.batchId] ?? l.batchId}</Text>
            <Text className="w-16 text-right text-foreground">{formatQty(l.expectedQty)}</Text>
            <View className="w-24 items-end">
              {draft ? (
                <TextInput
                  className="w-24 rounded-md border border-input bg-card px-2 py-1 text-right text-foreground"
                  keyboardType="numeric"
                  value={actual ?? ''}
                  onChangeText={(v) => setActuals((s) => ({ ...s, [l.batchId]: v }))}
                />
              ) : (
                <Text className="text-foreground">{l.actualQty == null ? '—' : formatQty(l.actualQty)}</Text>
              )}
            </View>
            <Text className={`w-16 text-right ${discColor}`}>
              {disc != null ? (disc > 0 ? `+${formatQty(disc)}` : formatQty(disc)) : (l.discrepancy == null ? '—' : formatQty(l.discrepancy))}
            </Text>
          </View>
        );
      })}

      {draft && (
        <View className="mt-4 flex-row gap-2">
          <Pressable className={`flex-1 rounded-md border border-border py-3 ${patch.isPending ? 'opacity-50' : ''}`} disabled={patch.isPending} onPress={() => void save()}>
            <Text className="text-center font-semibold text-foreground">{t('inventory.save')}</Text>
          </Pressable>
          <Pressable className={`flex-1 rounded-md bg-primary py-3 ${complete.isPending ? 'opacity-50' : ''}`} disabled={complete.isPending} onPress={askComplete}>
            <Text className="text-center font-semibold text-primary-foreground">{t('inventory.complete')}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
