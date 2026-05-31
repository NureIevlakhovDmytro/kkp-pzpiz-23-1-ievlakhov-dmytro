import type { StockLevelDto } from '@app/shared';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useStock } from '@/features/stock/use-stock';
import { formatDate, formatQty } from '@/lib/format';
import { useLookups } from '@/lib/use-lookups';

function StockRow({
  item,
  productName,
  locationName,
}: {
  item: StockLevelDto;
  productName: string;
  locationName: string;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
      <View className="flex-1 pr-3">
        <Text className="font-medium text-foreground">{productName}</Text>
        <Text className="text-xs text-muted-foreground">
          {locationName} · {formatDate(item.expiryDate)}
          {item.isExpired ? ` · ${t('batches.expired')}` : ''}
        </Text>
      </View>
      <Text className={`font-semibold ${item.isExpired ? 'text-danger' : 'text-foreground'}`}>
        {formatQty(item.quantity)}
      </Text>
    </View>
  );
}

export default function StockScreen() {
  const { t } = useTranslation();
  const { productName, locationName } = useLookups();
  const { data, isLoading, isError, refetch, isRefetching } = useStock();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="hsl(243 64% 57%)" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-danger">{t('common.loadError', 'Помилка завантаження')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={data ?? []}
      keyExtractor={(i) => `${i.batchId}:${i.locationId}`}
      renderItem={({ item }) => (
        <StockRow
          item={item}
          productName={productName[item.productId] ?? item.productId}
          locationName={locationName[item.locationId] ?? item.locationId}
        />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      ListEmptyComponent={
        <View className="items-center justify-center p-10">
          <Text className="text-muted-foreground">{t('common.empty')}</Text>
        </View>
      }
    />
  );
}
