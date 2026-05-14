import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export type InternalMobileDevicePayload = {
  installation_id: string;
  fingerprint?: string | null;
  model?: string | null;
  platform?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  push_token?: string | null;
};

export function buildInternalMobileDevicePayload(
  installationId: string,
  options?: { pushToken?: string | null; fingerprint?: string | null },
): InternalMobileDevicePayload {
  const appVersion = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '';

  return {
    installation_id: installationId,
    platform: Platform.OS,
    os_version: String(Platform.Version),
    model: Constants.deviceName ?? null,
    app_version: appVersion || null,
    push_token: options?.pushToken ?? undefined,
    fingerprint: options?.fingerprint ?? undefined,
  };
}
