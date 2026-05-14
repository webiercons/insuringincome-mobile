import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

export default function Index() {
  const { token, isReady, mobileAccess } = useAuth();

  if (!isReady) {
    return null;
  }

  if (token) {
    if (mobileAccess === 'restricted_pending_device') {
      return <Redirect href="/(internal)/device-pending" />;
    }
    return <Redirect href="/(internal)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(public)/(tabs)" />;
}
