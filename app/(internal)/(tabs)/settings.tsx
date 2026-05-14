import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
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

function formatMobileAccess(access: string): string {
  switch (access) {
    case 'full':
      return 'Approved — operator tools unlocked';
    case 'restricted_pending_device':
      return 'Pending — device approval required';
    case 'none':
      return 'Signed out';
    case 'unknown':
      return 'Unknown (bootstrap incomplete)';
    default:
      return access;
  }
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, token, mobileAccess, userSummary } = useAuth();
  const extra = useMemo(() => getExtra(), []);
  const { snapshot, refresh, checkOtaAndOfferReload, otaBusy, otaCheckMessage, lastOtaProbe } =
    useInternalDiagnostics();
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

  const buildNumberLabel = snapshot?.platform === 'ios' ? 'iOS build number' : 'Native build number';

  return (
    <ScreenShell title="Settings" subtitle="Operator tools, session, and diagnostics">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.identityCard}>
          <Text style={styles.identityTitle}>Build & update identity</Text>
          <Text style={styles.identityHint}>
            Use this block to confirm TestFlight binary vs OTA bundle, channel, and runtime alignment.
          </Text>
          {snapshot ? (
            <>
              <View style={styles.kv}>
                <Text style={styles.k}>App display name</Text>
                <Text style={styles.v}>{snapshot.appDisplayName}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Operator API (EXPO_PUBLIC_API_BASE_URL)</Text>
                <Text style={styles.vMono} selectable numberOfLines={4}>
                  {snapshot.apiBaseUrl || 'Not configured'}
                </Text>
              </View>
              <Text style={[styles.subtle, styles.afterApiHost]}>
                Host: {summarizeApiHost(snapshot.apiBaseUrl)}
              </Text>
              <View style={styles.kv}>
                <Text style={styles.k}>App semantic version</Text>
                <Text style={styles.vMono}>{snapshot.appVersion}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>{buildNumberLabel}</Text>
                <Text style={styles.vMono}>{snapshot.nativeBuildVersion ?? '—'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Native marketing version</Text>
                <Text style={styles.vMono}>{snapshot.nativeAppVersion ?? '—'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>OTA runtimeVersion</Text>
                <Text style={styles.vMono}>{snapshot.updatesRuntimeVersion}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>OTA update ID</Text>
                <Text style={styles.vMono}>{snapshot.updateId ?? '— (embedded / dev)'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>EAS Update channel</Text>
                <Text style={styles.vMono}>{snapshot.updatesChannel ?? '—'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Manifest branch (if present)</Text>
                <Text style={styles.vMono}>{snapshot.manifestBranch ?? '—'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Update bundle created (UTC)</Text>
                <Text style={styles.vMono}>{snapshot.updateCreatedAtIso ?? '—'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Bundle source</Text>
                <Text style={styles.vEmphasis}>{snapshot.bundleSourceLabel}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Last manual OTA check (UTC)</Text>
                <Text style={styles.vMono}>{lastOtaProbe?.atIso ?? '— (not run yet)'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Last OTA check result</Text>
                <Text style={styles.v}>{lastOtaProbe?.summary ?? '—'}</Text>
              </View>
              {snapshot.isEmergencyLaunch ? (
                <View style={styles.warnBanner}>
                  <Text style={styles.warnBannerText}>
                    Emergency launch: running embedded binary. {snapshot.emergencyLaunchReason ?? ''}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <ActivityIndicator style={styles.loader} />
          )}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Build-time app channel</Text>
          <Text style={styles.value}>{extra.appChannel}</Text>
          <Text style={styles.subtle}>From EXPO_PUBLIC_APP_CHANNEL at build; compare to EAS Update channel above.</Text>
        </View>

        <Text style={styles.sectionTitle}>Session & device</Text>
        <View style={styles.kv}>
          <Text style={styles.k}>Auth status</Text>
          <Text style={styles.v}>{token ? 'Signed in (token in SecureStore)' : 'Signed out'}</Text>
        </View>
        <View style={styles.kv}>
          <Text style={styles.k}>Device / mobile access</Text>
          <Text style={styles.v}>{formatMobileAccess(mobileAccess)}</Text>
        </View>
        <View style={styles.kv}>
          <Text style={styles.k}>Operator email</Text>
          <Text style={styles.v}>{userSummary?.email ?? '—'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Runtime</Text>
        {snapshot ? (
          <>
            <View style={styles.kv}>
              <Text style={styles.k}>Platform</Text>
              <Text style={styles.v}>{snapshot.platform}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Runtime (SDK) version</Text>
              <Text style={styles.vMono}>{snapshot.expoRuntime}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Over-the-air updates</Text>
              <Text style={styles.v}>{snapshot.updatesEnabled ? 'enabled' : 'disabled'}</Text>
            </View>
            <View style={styles.kv}>
              <Text style={styles.k}>Push permission</Text>
              <Text style={styles.v}>{snapshot.pushPermission}</Text>
            </View>
          </>
        ) : null}

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

        <Text style={styles.sectionTitle}>Push notifications</Text>
        <Text style={styles.note}>
          Registers this device with Apple’s notification service. The token identifies this installation — treat it as
          sensitive and share it only through approved internal channels.
        </Text>
        <Pressable
          onPress={() => void requestPushToken()}
          disabled={pushBusy}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, pushBusy && styles.disabled]}>
          {pushBusy ? (
            <ActivityIndicator color={InternalColors.accent} />
          ) : (
            <Text style={styles.secondaryBtnLabel}>Request permission & show push token</Text>
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
          Installed for upcoming features: document picker, on-device file access, and sharing. First use in product
          code may still require UX review; native modules ship after the next store build that includes them.
        </Text>

        <Text style={styles.note}>
          See docs/internal-mobile-dependency-roadmap.md and docs/internal-mobile-release-runbook.md for OTA vs
          TestFlight rules and publish commands.
        </Text>

        <Text style={styles.sectionTitle}>Consumer app</Text>
        <Text style={styles.note}>
          Browse public education, quote intake, and contact flows without leaving your signed-in session. Consumer
          screens do not call privileged operator APIs.
        </Text>
        <Pressable
          onPress={() => router.push('/(public)/(tabs)')}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}>
          <Text style={styles.secondaryBtnLabel}>Open consumer home</Text>
        </Pressable>

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
  identityCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: InternalColors.border,
    backgroundColor: InternalColors.surface,
    padding: 16,
    marginBottom: 20,
  },
  identityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: InternalColors.text,
    marginBottom: 6,
  },
  identityHint: {
    fontSize: 13,
    lineHeight: 18,
    color: InternalColors.textMuted,
    marginBottom: 14,
  },
  block: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 8,
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
  subtle: {
    marginTop: 6,
    fontSize: 13,
    color: InternalColors.textMuted,
    lineHeight: 18,
  },
  afterApiHost: {
    marginBottom: 12,
  },
  kv: {
    marginBottom: 10,
  },
  k: {
    fontSize: 11,
    fontWeight: '600',
    color: InternalColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  v: {
    marginTop: 4,
    fontSize: 15,
    color: InternalColors.text,
    lineHeight: 20,
  },
  vMono: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.text,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  vEmphasis: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: InternalColors.accent,
  },
  loader: {
    marginVertical: 12,
  },
  warnBanner: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  warnBannerText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#9a3412',
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
