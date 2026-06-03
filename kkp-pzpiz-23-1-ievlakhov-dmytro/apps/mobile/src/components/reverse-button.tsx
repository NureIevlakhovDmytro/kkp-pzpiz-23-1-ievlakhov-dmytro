import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text } from 'react-native';

export function ReverseButton({
  confirmMessage,
  disabled = false,
  onConfirm,
}: {
  confirmMessage: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const ask = () =>
    Alert.alert(t('writeOffs.reverse'), confirmMessage, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('writeOffs.reverse'), style: 'destructive', onPress: onConfirm },
    ]);
  return (
    <Pressable
      className={`rounded-md border border-danger px-4 py-2 ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      onPress={ask}
    >
      <Text className="font-semibold text-danger">{t('writeOffs.reverse')}</Text>
    </Pressable>
  );
}
