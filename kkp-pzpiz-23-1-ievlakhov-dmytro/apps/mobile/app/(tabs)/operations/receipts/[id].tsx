import { useLocalSearchParams, useRouter } from 'expo-router';
import { DocumentStatus } from '@app/shared';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { DocStatusBadge } from '@/components/doc-status-badge';
import { ReverseButton } from '@/components/reverse-button';
import { Loading } from '@/components/screen';
import { useReceipt, useReceiptMutations } from '@/features/receipts/use-receipts';
import { formatDate, formatQty } from '@/lib/format';
import { useLookups } from '@/lib/use-lookups';

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: r, isLoading } = useReceipt(id);
  const { reverse } = useReceiptMutations();
  const { productName, currencyCode } = useLookups();

  if (isLoading || !r) return <Loading />;
  const posted = r.status === DocumentStatus.POSTED;

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-foreground">{r.number}</Text>
        <DocStatusBadge status={r.status} />
      </View>
      <Text className="mb-4 text-muted-foreground">{r.date.slice(0, 10)}</Text>

      {r.lines.map((l) => (
        <View key={l.id} className="mb-2 rounded-md border border-border bg-card p-3">
          <Text className="font-medium text-foreground">{productName[l.productId] ?? l.productId}</Text>
          <Text className="text-xs text-muted-foreground">
            {t('receipts.batchNumber')}: {l.batchNumber} · {t('receipts.expiry')}: {formatDate(l.expiryDate)}
          </Text>
          <Text className="text-sm text-foreground">
            {formatQty(l.quantity)} · {formatQty(l.unitCost)} {currencyCode[l.currencyId] ?? ''}
          </Text>
        </View>
      ))}

      {posted && (
        <View className="mt-4">
          <ReverseButton
            confirmMessage={t('receipts.reverseConfirm')}
            disabled={reverse.isPending}
            onConfirm={() => reverse.mutate(r.id, { onSuccess: () => router.back() })}
          />
        </View>
      )}
    </ScrollView>
  );
}
