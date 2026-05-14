import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';
import { InternalColors } from '@/constants/internal-theme';
import { useAuth } from '@/contexts/auth-context';

export default function DevicePendingScreen() {
  const { userSummary, mobileAccess, syncBootstrap, signOut } = useAuth();
  const [polling, setPolling] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setBanner(null);
    setPolling(true);
    try {
      await syncBootstrap();
    } catch {
      setBanner('Unable to reach the server. Check your connection and try again.');
    } finally {
      setPolling(false);
    }
  }, [syncBootstrap]);

  useEffect(() => {
    if (mobileAccess === 'full') {
      router.replace('/(app)/(tabs)/dashboard');
    }
  }, [mobileAccess]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      const id = setInterval(() => void refresh(), 30_000);
      return () => clearInterval(id);
    }, [refresh]),
  );

  return (
    <ScreenShell title="Device awaiting approval" subtitle="Internal security">
      <Text style={styles.lead}>
        This installation is signed in, but a super administrator must approve this device before sensitive
        operator tools unlock.
      </Text>
      {userSummary ? (
        <View style={styles.card}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{userSummary.name || userSummary.email}</Text>
          <Text style={styles.muted}>{userSummary.email}</Text>
        </View>
      ) : null}
      {banner ? <Text style={styles.banner}>{banner}</Text> : null}
      <Pressable
        onPress={() => void refresh()}
        disabled={polling}
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, polling && styles.primaryDisabled]}>
        {polling ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryLabel}>Check approval status</Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => void signOut()}
        style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}>
        <Text style={styles.secondaryLabel}>Sign out</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: InternalColors.text,
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: InternalColors.border,
    backgroundColor: InternalColors.surface,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: InternalColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: InternalColors.text,
  },
  muted: {
    fontSize: 14,
    color: InternalColors.textMuted,
  },
  banner: {
    color: InternalColors.danger,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  primary: {
    backgroundColor: InternalColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryPressed: {
    opacity: 0.9,
  },
  primaryDisabled: {
    opacity: 0.65,
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: InternalColors.border,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: InternalColors.surface,
  },
  secondaryPressed: {
    opacity: 0.88,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: InternalColors.danger,
  },
});
