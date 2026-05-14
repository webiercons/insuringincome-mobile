import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';
import { InternalColors } from '@/constants/internal-theme';
import { useAuth } from '@/contexts/auth-context';
import { useInternalDiagnostics } from '@/hooks/use-internal-diagnostics';
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
  const { snapshot, refresh, checkOtaAndOfferReload, otaBusy, otaCheckMessage } = useInternalDiagnostics();
  const [pushBusy, setPushBusy] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  async function requestPushToken() {
    setPushError(null);
    setPushBusy(true);
    try {
      const perm = await Notifications.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        setPushError('Notification permission was not granted.');
        setPushToken(null);
        return;
      }
      const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
        ?.projectId;
      if (!projectId) {
        setPushError('Missing EAS projectId in app config (extra.eas.projectId).');
        return;
      }
      const device = await Notifications.getExpoPushTokenAsync({ projectId });
      setPushToken(device.data);
      await refresh();
    } catch (e) {
      setPushError(e instanceof Error ? e.message : 'Could not load push token.');
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <ScreenShell title="Settings" subtitle="Environment, session, and diagnostics">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.block}>
          <Text style={styles.label}>Release channel (build)</Text>
          <Text style={styles.value}>{extra.appChannel}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>API host</Text>
          <Text style={styles.value}>{summarizeApiHost(extra.apiBaseUrl)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Diagnostics</Text>
        {snapshot ? (
          <>
            <View style={styles.kv}>
              <Text style={styles.k}>expo.version</Text>
              <Text style={styles.v}>{snapshot.appVersion}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Native app / build</Text>
              <Text style={styles.v}>
                {snapshot.nativeAppVersion ?? '—'} ({snapshot.nativeBuildVersion ?? '—'})
              </Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Platform</Text>
              <Text style={styles.v}>{snapshot.platform}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Expo runtime</Text>
              <Text style={styles.v}>{snapshot.expoRuntime}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>EAS Update channel</Text>
              <Text style={styles.v}>{snapshot.updatesChannel ?? '—'}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Updates runtime version</Text>
              <Text style={styles.v}>{snapshot.updatesRuntimeVersion}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Current update id</Text>
              <Text style={styles.v}>{snapshot.updateId ?? 'embedded / none'}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Embedded launch</Text>
              <Text style={styles.v}>{snapshot.isEmbeddedLaunch ? 'yes' : 'no'}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>expo-updates enabled</Text>
              <Text style={styles.v}>{snapshot.updatesEnabled ? 'yes' : 'no'}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Push permission</Text>
              <Text style={styles.v}>{snapshot.pushPermission}</Text>
            </View>
          </>
        ) : (
          <ActivityIndicator style={styles.loader} />
        )}

        <Pressable
          onPress={() => void checkOtaAndOfferReload()}
          disabled={otaBusy}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, otaBusy && styles.disabled]}>
          {otaBusy ? (
            <ActivityIndicator color={InternalColors.accent} />
          ) : (
            <Text style={styles.secondaryBtnLabel}>Check for OTA update</Text>
          )}
        </Pressable>
        {otaCheckMessage ? <Text style={styles.hint}>{otaCheckMessage}</Text> : null}

        <Text style={styles.sectionTitle}>Push (Expo)</Text>
        <Text style={styles.note}>
          Registers this device with Expo push services. Send the token to Laravel only through approved internal
          channels (treat as sensitive).
        </Text>
        <Pressable
          onPress={() => void requestPushToken()}
          disabled={pushBusy}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, pushBusy && styles.disabled]}>
          {pushBusy ? (
            <ActivityIndicator color={InternalColors.accent} />
          ) : (
            <Text style={styles.secondaryBtnLabel}>Request permission & show Expo push token</Text>
          )}
        </Pressable>
        {pushError ? <Text style={styles.warn}>{pushError}</Text> : null}
        {pushToken ? (
          <Text style={styles.mono} selectable>
            {pushToken}
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>Operator file flows (next)</Text>
        <Text style={styles.note}>
          Installed for upcoming features: expo-document-picker, expo-file-system, expo-sharing. First use in
          product code may still require UX review; native modules ship after the next store build that includes
          them.
        </Text>

        <Text style={styles.note}>
          See docs/internal-mobile-dependency-roadmap.md and docs/internal-mobile-release-runbook.md for OTA vs
          TestFlight rules and publish commands.
        </Text>

        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}>
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    gap: 0,
  },
  block: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '700',
    color: InternalColors.text,
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
  kv: {
    marginBottom: 10,
  },
  k: {
    fontSize: 12,
    fontWeight: '600',
    color: InternalColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  v: {
    marginTop: 4,
    fontSize: 15,
    color: InternalColors.text,
    lineHeight: 20,
  },
  loader: {
    marginVertical: 12,
  },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: InternalColors.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: InternalColors.surface,
  },
  secondaryBtnPressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.55,
  },
  secondaryBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: InternalColors.accent,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.textMuted,
  },
  warn: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.danger,
  },
  mono: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    color: InternalColors.text,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.textMuted,
    marginBottom: 8,
  },
  signOut: {
    marginTop: 28,
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
