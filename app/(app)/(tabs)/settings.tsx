import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';
import { InternalColors } from '@/constants/internal-theme';
import { useAuth } from '@/contexts/auth-context';
import { getExtra } from '@/lib/env';

function summarizeApiHost(url: string): string {
  if (!url) {
    return 'Not configured';
  }
  try {
    return new URL(url).host;
  } catch {
    return 'Configured';
  }
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const extra = useMemo(() => getExtra(), []);

  return (
    <ScreenShell title="Settings" subtitle="Environment and session">
      <View style={styles.block}>
        <Text style={styles.label}>Release channel</Text>
        <Text style={styles.value}>{extra.appChannel}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>API host</Text>
        <Text style={styles.value}>{summarizeApiHost(extra.apiBaseUrl)}</Text>
      </View>
      <Text style={styles.note}>
        OTA updates are delivered with EAS Update on the channel that matches your build profile. Native
        changes still require a new store build.
      </Text>
      <Pressable
        onPress={() => void signOut()}
        style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}>
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: InternalColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    color: InternalColors.text,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.textMuted,
    marginBottom: 24,
  },
  signOut: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: InternalColors.border,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: InternalColors.surface,
  },
  signOutPressed: {
    opacity: 0.85,
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: InternalColors.danger,
  },
});
