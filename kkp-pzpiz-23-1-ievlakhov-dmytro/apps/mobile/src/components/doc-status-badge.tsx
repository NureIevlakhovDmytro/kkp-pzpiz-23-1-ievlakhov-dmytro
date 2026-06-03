import { DocumentStatus } from '@app/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useTranslation();
  const reversed = status === DocumentStatus.REVERSED;
  return (
    <View className={`self-start rounded-full px-2.5 py-0.5 ${reversed ? 'bg-muted' : 'bg-primary/15'}`}>
      <Text className={`text-xs font-medium ${reversed ? 'text-muted-foreground' : 'text-primary'}`}>
        {reversed ? t('writeOffs.reversed') : t('writeOffs.posted')}
      </Text>
    </View>
  );
}
