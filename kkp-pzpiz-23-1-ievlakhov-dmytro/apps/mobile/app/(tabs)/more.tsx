import { Locale } from '@app/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { apiFetch } from '@/lib/api-client';
import { setStoredLang } from '@/lib/lang-store';

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const switchLang = async (lang: 'uk' | 'en') => {
    await i18n.changeLanguage(lang);
    await setStoredLang(lang);
    try {
      await apiFetch('/auth/me', { method: 'PATCH', body: { locale: lang === 'uk' ? Locale.UK : Locale.EN } });
    } catch {
      // locale still applied locally; server sync is best-effort
    }
  };

  return (
    <View className="flex-1 gap-6 bg-background p-6">
      <View>
        <Text className="text-lg font-semibold text-foreground">{user?.fullName}</Text>
        <Text className="text-muted-foreground">{user?.email}</Text>
      </View>
      <View className="flex-row gap-3">
        <Pressable className="rounded-md border border-border px-4 py-2" onPress={() => void switchLang('uk')}>
          <Text className="text-foreground">Українська</Text>
        </Pressable>
        <Pressable className="rounded-md border border-border px-4 py-2" onPress={() => void switchLang('en')}>
          <Text className="text-foreground">English</Text>
        </Pressable>
      </View>
      <Pressable className="rounded-md bg-danger px-4 py-3" onPress={() => void logout()}>
        <Text className="text-center font-semibold text-white">{t('auth.logout')}</Text>
      </Pressable>
    </View>
  );
}
