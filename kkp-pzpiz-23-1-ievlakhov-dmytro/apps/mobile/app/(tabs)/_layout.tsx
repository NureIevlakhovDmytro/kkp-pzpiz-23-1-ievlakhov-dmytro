import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: 'hsl(243 64% 57%)',
      }}
    >
      <Tabs.Screen name="stock" options={{ title: t('nav.stock') }} />
      <Tabs.Screen name="operations" options={{ title: t('nav.operations', 'Операції'), headerShown: false }} />
      <Tabs.Screen name="inventory" options={{ title: t('nav.inventory') }} />
      <Tabs.Screen name="notifications" options={{ title: t('nav.notifications') }} />
      <Tabs.Screen name="more" options={{ title: t('nav.more', 'Ще') }} />
    </Tabs>
  );
}
