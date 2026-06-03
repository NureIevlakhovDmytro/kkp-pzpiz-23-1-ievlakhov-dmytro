import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function OperationsLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t('nav.operations', 'Операції') }} />
      <Stack.Screen name="receipts/index" options={{ title: t('receipts.title') }} />
      <Stack.Screen name="receipts/new" options={{ title: t('receipts.new'), presentation: 'modal' }} />
      <Stack.Screen name="receipts/[id]" options={{ title: t('receipts.title') }} />
      <Stack.Screen name="write-offs/index" options={{ title: t('writeOffs.title') }} />
      <Stack.Screen name="write-offs/new" options={{ title: t('writeOffs.new'), presentation: 'modal' }} />
      <Stack.Screen name="write-offs/[id]" options={{ title: t('writeOffs.title') }} />
    </Stack>
  );
}
