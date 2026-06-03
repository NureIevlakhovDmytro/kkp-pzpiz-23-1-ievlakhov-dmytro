import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Select } from '@/components/select';
import { formatQty } from '@/lib/format';
import { useLookups } from '@/lib/use-lookups';
import { useFefo } from './use-stock';

export function FefoWidget() {
  const { t } = useTranslation();
  const { products, locations, productName } = useLookups();
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const fefo = useFefo();
  const result = fefo.data;

  const canRun = !!productId && !!locationId && !fefo.isPending;

  return (
    <View className="m-4 rounded-lg border border-border bg-card p-4">
      <Text className="text-base font-semibold text-foreground">{t('stock.fefoTitle')}</Text>
      <Text className="mb-3 text-xs text-muted-foreground">{t('stock.fefoDesc')}</Text>

      <View className="gap-2">
        <Select
          value={productId}
          onChange={setProductId}
          placeholder={t('batches.product')}
          options={products.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Select
          value={locationId}
          onChange={setLocationId}
          placeholder={t('stock.location')}
          options={locations.map((l) => ({ value: l.id, label: l.name }))}
        />
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Pressable
            className={`justify-center rounded-md bg-primary px-4 ${canRun ? '' : 'opacity-50'}`}
            disabled={!canRun}
            onPress={() => fefo.mutate({ productId, locationId, quantity: Number(quantity) })}
          >
            <Text className="font-semibold text-primary-foreground">{t('stock.calc')}</Text>
          </Pressable>
        </View>
      </View>

      {result && (
        <View className="mt-3 rounded-md border border-border p-3">
          <View className="mb-2 flex-row flex-wrap gap-2">
            <Text className="text-sm text-info">{t('stock.requested')}: {formatQty(result.requested)}</Text>
            <Text className="text-sm text-foreground">· {t('stock.allocated')}: {formatQty(result.allocated)}</Text>
            {result.shortfall > 0 && (
              <Text className="text-sm text-danger">· {t('stock.shortfall')}: {formatQty(result.shortfall)}</Text>
            )}
          </View>
          {result.allocations.map((a) => (
            <View key={a.batchId} className="flex-row justify-between border-b border-border/60 py-1">
              <Text className="text-muted-foreground">{productName[result.productId] ?? `${a.batchId.slice(0, 8)}…`}</Text>
              <Text className="text-foreground">{formatQty(a.allocated)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
