import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, TextInput } from 'react-native';
import { Select } from '@/components/select';
import { ApiError } from '@/lib/api-client';
import { today } from '@/lib/date';
import { useLookups } from '@/lib/use-lookups';
import { useInventoryMutations } from '@/features/inventory/use-inventory';

export default function InventoryNew() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locations } = useLookups();
  const { create } = useInventoryMutations();
  const [locationId, setLocationId] = useState('');
  const [date, setDate] = useState(today());

  async function submit() {
    if (!locationId) { Alert.alert(t('inventory.location')); return; }
    try {
      const created = await create.mutateAsync({ locationId, date });
      router.replace(`/(tabs)/inventory/${created.id}`);
    } catch (e) {
      Alert.alert(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const inputCls = 'rounded-md border border-input bg-card px-3 py-2 text-foreground';

  return (
    <ScrollView className="flex-1 bg-background p-4" contentContainerClassName="gap-3">
      <Text className="text-muted-foreground">{t('inventory.location')} *</Text>
      <Select value={locationId} onChange={setLocationId} placeholder="—" options={locations.map((l) => ({ value: l.id, label: l.name }))} />
      <Text className="text-muted-foreground">{t('inventory.date')}</Text>
      <TextInput className={inputCls} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="hsl(216 16% 37%)" />
      <Pressable className={`mt-2 rounded-md bg-primary py-3 ${create.isPending ? 'opacity-50' : ''}`} disabled={create.isPending} onPress={() => void submit()}>
        <Text className="text-center font-semibold text-primary-foreground">{t('common.create')}</Text>
      </Pressable>
    </ScrollView>
  );
}
