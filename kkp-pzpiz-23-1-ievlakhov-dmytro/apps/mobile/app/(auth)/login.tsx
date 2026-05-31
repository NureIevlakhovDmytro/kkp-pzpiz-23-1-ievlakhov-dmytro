import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch {
      setError(t('auth.invalidCredentials', 'Невірний email або пароль'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 justify-center gap-4 bg-background p-6">
      <Text className="mb-2 text-2xl font-bold text-foreground">{t('auth.title')}</Text>

      <TextInput
        className="rounded-md border border-input bg-card px-3 py-3 text-foreground"
        placeholder={t('auth.email')}
        placeholderTextColor="hsl(216 16% 37%)"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="rounded-md border border-input bg-card px-3 py-3 text-foreground"
        placeholder={t('auth.password')}
        placeholderTextColor="hsl(216 16% 37%)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text className="text-danger">{error}</Text> : null}

      <Pressable
        className="mt-2 rounded-md bg-primary px-4 py-3"
        disabled={busy}
        onPress={() => void onSubmit()}
      >
        {busy ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-center font-semibold text-primary-foreground">{t('auth.signIn')}</Text>
        )}
      </Pressable>
    </View>
  );
}
