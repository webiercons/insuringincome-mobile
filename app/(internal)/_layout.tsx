import { Redirect, Stack, useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

export default function AppLayout() {
  const { token, isReady, mobileAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }
    if (mobileAccess === 'restricted_pending_device') {
      router.replace('/(internal)/device-pending' as Href);
    }
  }, [isReady, token, mobileAccess, router]);

  if (!isReady) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(public)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="device-pending" />
    </Stack>
  );
}
