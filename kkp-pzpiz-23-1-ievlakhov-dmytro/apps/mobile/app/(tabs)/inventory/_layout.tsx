import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function InventoryLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t('inventory.title') }} />
      <Stack.Screen name="new" options={{ title: t('inventory.new'), presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: t('inventory.title') }} />
    </Stack>
  );
}
