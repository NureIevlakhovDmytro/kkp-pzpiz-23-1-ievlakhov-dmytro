import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Select } from '@/components/select';
import { ApiError } from '@/lib/api-client';
import { today } from '@/lib/date';
import { useLookups } from '@/lib/use-lookups';
import { newUuid } from '@/lib/uuid';
import { useReceiptMutations } from '@/features/receipts/use-receipts';
import type { ReceiptInput, ReceiptLineInput } from '@/features/receipts/receipts.api';

interface LineState { productId: string; batchNumber: string; expiryDate: string; quantity: string; unitCost: string; currencyId: string; }
const emptyLine = (currencyId: string): LineState => ({ productId: '', batchNumber: '', expiryDate: '', quantity: '', unitCost: '', currencyId });

export default function ReceiptNew() {
  const { t } = useTranslation();
  const router = useRouter();
  const { products, locations, suppliers, currencies } = useLookups();
  const { post } = useReceiptMutations();
  const defaultCurrency = currencies[0]?.id ?? '';

  const [supplierId, setSupplierId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [date, setDate] = useState(today());
  const [lines, setLines] = useState<LineState[]>([emptyLine('')]);

  const setLine = (i: number, patch: Partial<LineState>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  async function submit() {
    if (!locationId) { Alert.alert(t('receipts.location')); return; }
    const started = lines.filter((l) => l.productId || l.batchNumber || Number(l.quantity) > 0 || l.expiryDate);
    const complete = started.filter((l) => l.productId && l.batchNumber && Number(l.quantity) > 0 && (l.currencyId || defaultCurrency));
    if (started.length === 0 || complete.length !== started.length) { Alert.alert(t('receipts.lineInvalid')); return; }
    const body: ReceiptInput = {
      supplierId: supplierId || undefined,
      locationId,
      date,
      lines: complete.map<ReceiptLineInput>((l) => ({
        productId: l.productId,
        batchNumber: l.batchNumber,
        expiryDate: l.expiryDate || undefined,
        quantity: Number(l.quantity),
        unitCost: Number(l.unitCost) || 0,
        currencyId: l.currencyId || defaultCurrency,
      })),
    };
    try {
      await post.mutateAsync({ body, key: newUuid() });
      router.back();
    } catch (e) {
      Alert.alert(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const inputCls = 'rounded-md border border-input bg-card px-3 py-2 text-foreground';

  return (
    <ScrollView className="flex-1 bg-background p-4" contentContainerClassName="gap-3">
      <Text className="text-muted-foreground">{t('receipts.date')}</Text>
      <TextInput className={inputCls} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="hsl(216 16% 37%)" />
      <Text className="text-muted-foreground">{t('receipts.location')} *</Text>
      <Select value={locationId} onChange={setLocationId} placeholder="—" options={locations.map((l) => ({ value: l.id, label: l.name }))} />
      <Text className="text-muted-foreground">{t('receipts.supplier')}</Text>
      <Select value={supplierId} onChange={setSupplierId} placeholder="—" options={suppliers.map((s) => ({ value: s.id, label: s.name }))} />

      {lines.map((l, i) => (
        <View key={i} className="gap-2 rounded-md border border-border bg-card p-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-medium text-foreground">#{i + 1}</Text>
            {lines.length > 1 && (
              <Pressable onPress={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}><Text className="text-danger">✕</Text></Pressable>
            )}
          </View>
          <Select value={l.productId} onChange={(v) => setLine(i, { productId: v })} placeholder={t('receipts.product')} options={products.map((p) => ({ value: p.id, label: p.name }))} />
          <TextInput className={inputCls} value={l.batchNumber} onChangeText={(v) => setLine(i, { batchNumber: v })} placeholder={t('receipts.batchNumber')} placeholderTextColor="hsl(216 16% 37%)" />
          <TextInput className={inputCls} value={l.expiryDate} onChangeText={(v) => setLine(i, { expiryDate: v })} placeholder={t('receipts.expiry')} placeholderTextColor="hsl(216 16% 37%)" />
          <TextInput className={inputCls} keyboardType="numeric" value={l.quantity} onChangeText={(v) => setLine(i, { quantity: v })} placeholder={t('receipts.quantity')} placeholderTextColor="hsl(216 16% 37%)" />
          <TextInput className={inputCls} keyboardType="numeric" value={l.unitCost} onChangeText={(v) => setLine(i, { unitCost: v })} placeholder={t('receipts.unitCost')} placeholderTextColor="hsl(216 16% 37%)" />
          <Select value={l.currencyId || defaultCurrency} onChange={(v) => setLine(i, { currencyId: v })} placeholder={t('receipts.currency')} options={currencies.map((c) => ({ value: c.id, label: c.code }))} />
        </View>
      ))}

      <Pressable className="rounded-md border border-border py-2" onPress={() => setLines((ls) => [...ls, emptyLine(defaultCurrency)])}>
        <Text className="text-center text-foreground">{t('receipts.addLine')}</Text>
      </Pressable>
      <Pressable className={`rounded-md bg-primary py-3 ${post.isPending ? 'opacity-50' : ''}`} disabled={post.isPending} onPress={() => void submit()}>
        <Text className="text-center font-semibold text-primary-foreground">{t('common.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}
