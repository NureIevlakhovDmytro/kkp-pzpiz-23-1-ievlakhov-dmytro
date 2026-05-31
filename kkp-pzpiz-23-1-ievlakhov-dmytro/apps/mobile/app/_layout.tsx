import '../global.css';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Providers } from '@/components/providers';
import { useAuth } from '@/features/auth/auth-context';

function Gate() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)/login');
    else if (user && inAuthGroup) router.replace('/(tabs)/stock');
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="hsl(243 64% 57%)" />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <Providers>
      <Gate />
    </Providers>
  );
}
