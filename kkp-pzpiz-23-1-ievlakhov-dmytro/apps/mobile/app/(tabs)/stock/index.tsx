import type { StockLevelDto } from '@app/shared';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Select } from '@/components/select';
import { EmptyState, ErrorState, Loading } from '@/components/screen';
import { FefoWidget } from '@/features/stock/fefo-widget';
import { LowStockCard } from '@/features/stock/low-stock-card';
import { useStock } from '@/features/stock/use-stock';
import { formatDate, formatQty } from '@/lib/format';
import { useLookups } from '@/lib/use-lookups';

function StockRow({ item, productName, locationName, expiredLabel }: {
  item: StockLevelDto; productName: string; locationName: string; expiredLabel: string;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
      <View className="flex-1 pr-3">
        <Text className="font-medium text-foreground">{productName}</Text>
        <Text className="text-xs text-muted-foreground">
          {locationName} · {formatDate(item.expiryDate)}{item.isExpired ? ` · ${expiredLabel}` : ''}
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
  const { productName, locationName, products, locations } = useLookups();
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [onlyExpired, setOnlyExpired] = useState(false);
  const { data, isLoading, isError, refetch, isRefetching } = useStock(productId || undefined, locationId || undefined);

  const rows = useMemo(
    () => (data ?? []).filter((r) => (onlyExpired ? r.isExpired : true)),
    [data, onlyExpired],
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState />;

  return (
    <FlatList
      className="flex-1 bg-background"
      data={rows}
      keyExtractor={(i) => `${i.batchId}:${i.locationId}`}
      ListHeaderComponent={
        <View>
          <LowStockCard />
          <FefoWidget />
          <View className="gap-2 px-4 pb-2">
            <Select value={productId} onChange={setProductId} placeholder={t('batches.filterProduct')}
              options={[{ value: '', label: t('common.empty') }, ...products.map((p) => ({ value: p.id, label: p.name }))]} />
            <Select value={locationId} onChange={setLocationId} placeholder={t('stock.location')}
              options={[{ value: '', label: t('common.empty') }, ...locations.map((l) => ({ value: l.id, label: l.name }))]} />
            <Pressable
              className={`self-start rounded-md border px-3 py-2 ${onlyExpired ? 'border-danger bg-danger/10' : 'border-border'}`}
              onPress={() => setOnlyExpired((v) => !v)}
            >
              <Text className={onlyExpired ? 'text-danger' : 'text-foreground'}>{t('batches.onlyExpired')}</Text>
            </Pressable>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <StockRow item={item} expiredLabel={t('batches.expired')}
          productName={productName[item.productId] ?? item.productId}
          locationName={locationName[item.locationId] ?? item.locationId} />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      ListEmptyComponent={<EmptyState />}
    />
  );
}
