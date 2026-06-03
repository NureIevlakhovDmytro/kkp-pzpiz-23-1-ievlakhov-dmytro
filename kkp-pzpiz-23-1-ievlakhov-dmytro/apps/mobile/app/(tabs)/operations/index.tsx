import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

function HubCard({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link href={href} asChild>
      <Pressable className="rounded-lg border border-border bg-card p-5">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
      </Pressable>
    </Link>
  );
}

export default function OperationsHub() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 gap-4 bg-background p-4">
      <HubCard href="/(tabs)/operations/receipts" title={t('receipts.title')} subtitle={t('receipts.subtitle')} />
      <HubCard href="/(tabs)/operations/write-offs" title={t('writeOffs.title')} subtitle={t('writeOffs.subtitle')} />
    </View>
  );
}
