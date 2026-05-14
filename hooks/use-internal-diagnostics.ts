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
  updatesRuntimeVersion: string;
  updateId: string | null;
  isEmbeddedLaunch: boolean;
  pushPermission: Notifications.PermissionStatus | 'unavailable';
};

function formatRuntimeVersion(): string {
  const v = Updates.runtimeVersion;
  if (v == null) {
    return '—';
  }
  return typeof v === 'string' ? v : JSON.stringify(v);
}

export function useInternalDiagnostics() {
  const [snapshot, setSnapshot] = useState<DiagnosticsSnapshot | null>(null);
  const [otaCheckMessage, setOtaCheckMessage] = useState<string | null>(null);
  const [otaBusy, setOtaBusy] = useState(false);

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
      updatesRuntimeVersion: formatRuntimeVersion(),
      updateId: Updates.updateId,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      pushPermission,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const checkOtaAndOfferReload = useCallback(async () => {
    setOtaCheckMessage(null);
    if (__DEV__) {
      setOtaCheckMessage('OTA is not applied in Expo Go / dev by default; use a release build with expo-updates enabled.');
      return;
    }
    if (!Updates.isEnabled) {
      setOtaCheckMessage('OTA updates are not enabled in this build.');
      return;
    }
    setOtaBusy(true);
    try {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) {
        setOtaCheckMessage('No newer bundle on the server for this channel and runtime.');
        return;
      }
      const fetched = await Updates.fetchUpdateAsync();
      if (!fetched.isNew) {
        setOtaCheckMessage('No downloadable update newer than the current bundle.');
        return;
      }
      Alert.alert(
        'Update ready',
        'A new JavaScript bundle was downloaded. Restart now to apply it?',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Restart', onPress: () => void Updates.reloadAsync() },
        ],
      );
    } catch (e) {
      setOtaCheckMessage(e instanceof Error ? e.message : 'Update check failed.');
    } finally {
      setOtaBusy(false);
    }
  }, []);

  return { snapshot, refresh, checkOtaAndOfferReload, otaBusy, otaCheckMessage };
}
