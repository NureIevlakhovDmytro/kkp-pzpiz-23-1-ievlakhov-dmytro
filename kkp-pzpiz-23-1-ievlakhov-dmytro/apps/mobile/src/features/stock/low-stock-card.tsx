import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatQty } from '@/lib/format';
import { useLowStock } from './use-stock';

export function LowStockCard() {
  const { t } = useTranslation();
  const { data } = useLowStock();
  const rows = data ?? [];

  return (
    <View className="m-4 mb-0 rounded-lg border border-danger/40 bg-danger/5 p-4">
      <Text className="mb-2 text-base font-semibold text-danger">{t('stock.lowTitle')}</Text>
      {rows.length === 0 ? (
        <Text className="text-sm text-muted-foreground">{t('stock.lowEmpty')}</Text>
      ) : (
        rows.map((r) => (
          <View key={r.productId} className="flex-row justify-between border-b border-border/60 py-1.5">
            <Text className="flex-1 pr-2 text-foreground">{r.productName}</Text>
            <Text className="text-danger">
              {formatQty(r.totalQuantity)} / {formatQty(r.minStock)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
