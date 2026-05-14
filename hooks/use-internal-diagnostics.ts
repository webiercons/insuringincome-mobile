import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export type DiagnosticsSnapshot = {
  appVersion: string;
  nativeAppVersion: string | null;
  nativeBuildVersion: string | null;
  platform: string;
  expoRuntime: string;
  updatesEnabled: boolean;
  updatesChannel: string | null;
  manifestBranch: string | null;
  updatesRuntimeVersion: string;
  updateId: string | null;
  updateCreatedAtIso: string | null;
  isEmbeddedLaunch: boolean;
  isEmergencyLaunch: boolean;
  emergencyLaunchReason: string | null;
  bundleSourceLabel: string;
  pushPermission: Notifications.PermissionStatus | 'unavailable';
};

export type LastOtaProbe = {
  atIso: string;
  summary: string;
};

function formatRuntimeVersion(): string {
  const v = Updates.runtimeVersion;
  if (v == null) {
    return '—';
  }
  return typeof v === 'string' ? v : JSON.stringify(v);
}

function extractManifestBranch(): string | null {
  try {
    const m = Updates.manifest;
    if (!m || typeof m !== 'object') {
      return null;
    }
    const meta = (m as { metadata?: unknown }).metadata;
    if (meta && typeof meta === 'object' && meta !== null) {
      const branch = (meta as Record<string, unknown>).branch;
      if (typeof branch === 'string' && branch.trim() !== '') {
        return branch.trim();
      }
    }
  } catch {
    return null;
  }
  return null;
}

function formatUpdateCreatedAt(): string | null {
  const d = Updates.createdAt;
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}

function computeBundleSourceLabel(
  isEmergencyLaunch: boolean,
  isEmbeddedLaunch: boolean,
  emergencyReason: string | null,
): string {
  if (isEmergencyLaunch) {
    const detail = emergencyReason?.trim() ? ` (${emergencyReason.trim()})` : '';
    return `Emergency fallback — embedded binary${detail}`;
  }
  if (isEmbeddedLaunch) {
    return 'Embedded in store / TestFlight binary';
  }
  return 'OTA-downloaded bundle (active)';
}

export function useInternalDiagnostics() {
  const [snapshot, setSnapshot] = useState<DiagnosticsSnapshot | null>(null);
  const [otaCheckMessage, setOtaCheckMessage] = useState<string | null>(null);
  const [otaBusy, setOtaBusy] = useState(false);
  const [lastOtaProbe, setLastOtaProbe] = useState<LastOtaProbe | null>(null);

  const refresh = useCallback(async () => {
    let pushPermission: DiagnosticsSnapshot['pushPermission'] = 'unavailable';
    try {
      const r = await Notifications.getPermissionsAsync();
      pushPermission = r.status;
    } catch {
      pushPermission = 'unavailable';
    }

    setSnapshot({
      appVersion: Constants.expoConfig?.version ?? '—',
      nativeAppVersion: Application.nativeApplicationVersion,
      nativeBuildVersion: Application.nativeBuildVersion,
      platform: Platform.OS,
      expoRuntime: Constants.expoRuntimeVersion ?? '—',
      updatesEnabled: Updates.isEnabled,
      updatesChannel: Updates.channel,
      manifestBranch: extractManifestBranch(),
      updatesRuntimeVersion: formatRuntimeVersion(),
      updateId: Updates.updateId,
      updateCreatedAtIso: formatUpdateCreatedAt(),
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      isEmergencyLaunch: Updates.isEmergencyLaunch,
      emergencyLaunchReason: Updates.emergencyLaunchReason,
      bundleSourceLabel: computeBundleSourceLabel(
        Updates.isEmergencyLaunch,
        Updates.isEmbeddedLaunch,
        Updates.emergencyLaunchReason,
      ),
      pushPermission,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordOtaProbe = useCallback((summary: string) => {
    setLastOtaProbe({ atIso: new Date().toISOString(), summary });
  }, []);

  const checkOtaAndOfferReload = useCallback(async () => {
    setOtaCheckMessage(null);
    if (__DEV__) {
      const msg =
        'OTA updates do not apply in local development by default. Install a TestFlight or release build with OTA enabled to verify update delivery.';
      setOtaCheckMessage(msg);
      recordOtaProbe(msg);
      return;
    }
    if (!Updates.isEnabled) {
      const msg = 'OTA updates are not enabled in this build.';
      setOtaCheckMessage(msg);
      recordOtaProbe(msg);
      return;
    }
    setOtaBusy(true);
    try {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) {
        const msg = 'No newer bundle on the server for this channel and runtime.';
        setOtaCheckMessage(msg);
        recordOtaProbe(msg);
        return;
      }
      const fetched = await Updates.fetchUpdateAsync();
      if (!fetched.isNew) {
        const msg = 'No downloadable update newer than the current bundle.';
        setOtaCheckMessage(msg);
        recordOtaProbe(msg);
        return;
      }
      recordOtaProbe('Update downloaded — awaiting user restart.');
      Alert.alert(
        'Update ready',
        'A new JavaScript bundle was downloaded. Restart now to apply it?',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Restart', onPress: () => void Updates.reloadAsync() },
        ],
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update check failed.';
      setOtaCheckMessage(msg);
      recordOtaProbe(msg);
    } finally {
      setOtaBusy(false);
      void refresh();
    }
  }, [recordOtaProbe, refresh]);

  return { snapshot, refresh, checkOtaAndOfferReload, otaBusy, otaCheckMessage, lastOtaProbe };
}
