import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Select } from '@/components/select';
import { ApiError } from '@/lib/api-client';
import { today } from '@/lib/date';
import { useBatchLabels } from '@/lib/use-batches';
import { useLookups } from '@/lib/use-lookups';
import { newUuid } from '@/lib/uuid';
import { fefoToLines } from '@/features/write-offs/fefo-prefill';
import { useWriteOffMutations, useWriteOffReasons } from '@/features/write-offs/use-write-offs';
import { writeOffsApi, type WriteOffInput, type WriteOffLineInput } from '@/features/write-offs/write-offs.api';

interface LineState { batchId: string; locationId: string; quantity: string; }
const emptyLine = (): LineState => ({ batchId: '', locationId: '', quantity: '' });

export default function WriteOffNew() {
  const { t } = useTranslation();
  const router = useRouter();
  const { products, locations } = useLookups();
  const { batches } = useBatchLabels();
  const { data: reasons } = useWriteOffReasons();
  const { post } = useWriteOffMutations();

  const [date, setDate] = useState(today());
  const [reasonId, setReasonId] = useState('');
  const [comment, setComment] = useState('');
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [fefo, setFefo] = useState({ productId: '', locationId: '', quantity: '10' });

  const setLine = (i: number, patch: Partial<LineState>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  async function runFefo() {
    if (!fefo.productId || !fefo.locationId) return;
    try {
      const res = await writeOffsApi.fefo(fefo.productId, fefo.locationId, Number(fefo.quantity));
      const mapped = fefoToLines(res, fefo.locationId);
      if (mapped.length === 0) { Alert.alert(`${t('writeOffs.shortfallWarn')}: ${res.shortfall}`); return; }
      setLines(mapped.map((m) => ({ batchId: m.batchId, locationId: m.locationId, quantity: String(m.quantity) })));
      if (res.shortfall > 0) Alert.alert(`${t('writeOffs.shortfallWarn')}: ${res.shortfall}`);
    } catch (e) {
      Alert.alert(e instanceof ApiError ? e.message : 'Error');
    }
  }

  async function submit() {
    if (!reasonId) { Alert.alert(t('writeOffs.reason')); return; }
    const valid = lines.filter((l) => l.batchId && l.locationId && Number(l.quantity) > 0);
    if (valid.length === 0) { Alert.alert(t('receipts.lineInvalid')); return; }
    const body: WriteOffInput = {
      date,
      reasonId,
      comment: comment || undefined,
      lines: valid.map<WriteOffLineInput>((l) => ({ batchId: l.batchId, locationId: l.locationId, quantity: Number(l.quantity) })),
    };
    try {
      await post.mutateAsync({ body, key: newUuid() });
      router.back();
    } catch (e) {
      Alert.alert(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const inputCls = 'rounded-md border border-input bg-card px-3 py-2 text-foreground';
  const batchOptions = batches.map((b) => ({ value: b.id, label: b.batchNumber }));
  const locationOptions = locations.map((l) => ({ value: l.id, label: l.name }));

  return (
    <ScrollView className="flex-1 bg-background p-4" contentContainerClassName="gap-3">
      <Text className="text-muted-foreground">{t('writeOffs.date')}</Text>
      <TextInput className={inputCls} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="hsl(216 16% 37%)" />
      <Text className="text-muted-foreground">{t('writeOffs.reason')} *</Text>
      <Select value={reasonId} onChange={setReasonId} placeholder="—" options={(reasons ?? []).map((r) => ({ value: r.id, label: r.nameUk }))} />
      <Text className="text-muted-foreground">{t('writeOffs.comment')}</Text>
      <TextInput className={inputCls} value={comment} onChangeText={setComment} multiline />

      <View className="gap-2 rounded-md border border-info/40 bg-info/5 p-3">
        <Text className="font-medium text-info">{t('writeOffs.fefoHelper')}</Text>
        <Select value={fefo.productId} onChange={(v) => setFefo((s) => ({ ...s, productId: v }))} placeholder={t('writeOffs.product')} options={products.map((p) => ({ value: p.id, label: p.name }))} />
        <Select value={fefo.locationId} onChange={(v) => setFefo((s) => ({ ...s, locationId: v }))} placeholder={t('writeOffs.location')} options={locationOptions} />
        <TextInput className={inputCls} keyboardType="numeric" value={fefo.quantity} onChangeText={(v) => setFefo((s) => ({ ...s, quantity: v }))} />
        <Pressable className={`rounded-md bg-info py-2 ${!fefo.productId || !fefo.locationId ? 'opacity-50' : ''}`} disabled={!fefo.productId || !fefo.locationId} onPress={() => void runFefo()}>
          <Text className="text-center font-semibold text-white">{t('writeOffs.fill')}</Text>
        </Pressable>
      </View>

      {lines.map((l, i) => (
        <View key={i} className="gap-2 rounded-md border border-border bg-card p-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-medium text-foreground">#{i + 1}</Text>
            {lines.length > 1 && (
              <Pressable onPress={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}><Text className="text-danger">✕</Text></Pressable>
            )}
          </View>
          <Select value={l.batchId} onChange={(v) => setLine(i, { batchId: v })} placeholder={t('writeOffs.batch')} options={batchOptions} />
          <Select value={l.locationId} onChange={(v) => setLine(i, { locationId: v })} placeholder={t('writeOffs.location')} options={locationOptions} />
          <TextInput className={inputCls} keyboardType="numeric" value={l.quantity} onChangeText={(v) => setLine(i, { quantity: v })} placeholder={t('writeOffs.quantity')} placeholderTextColor="hsl(216 16% 37%)" />
        </View>
      ))}

      <Pressable className="rounded-md border border-border py-2" onPress={() => setLines((ls) => [...ls, emptyLine()])}>
        <Text className="text-center text-foreground">{t('writeOffs.addLine')}</Text>
      </Pressable>
      <Pressable className={`rounded-md bg-primary py-3 ${post.isPending ? 'opacity-50' : ''}`} disabled={post.isPending} onPress={() => void submit()}>
        <Text className="text-center font-semibold text-primary-foreground">{t('common.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}
