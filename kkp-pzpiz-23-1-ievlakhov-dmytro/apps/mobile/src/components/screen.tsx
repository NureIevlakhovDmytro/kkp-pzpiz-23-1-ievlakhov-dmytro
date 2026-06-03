import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

const SPINNER = 'hsl(243 64% 57%)';

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color={SPINNER} />
    </View>
  );
}

export function ErrorState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-danger">{message ?? t('common.loadError', 'Помилка завантаження')}</Text>
    </View>
  );
}

export function EmptyState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <View className="items-center justify-center p-10">
      <Text className="text-muted-foreground">{message ?? t('common.empty')}</Text>
    </View>
  );
}
