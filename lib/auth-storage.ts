import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'insuringincome.internal.access_token';
const REFRESH_KEY = 'insuringincome.internal.refresh_token';
/** Legacy single-token storage from pre–internal-mobile auth; cleared on read. */
const LEGACY_TOKEN_KEY = 'insuringincome.auth.token';

const secureOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

type WebSession = { access: string | null; refresh: string | null };
const webSession: WebSession = { access: null, refresh: null };

export type StoredInternalMobileSession = {
  accessToken: string;
  refreshToken: string;
};

async function deleteLegacyIfPresent(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function getStoredInternalMobileSession(): Promise<StoredInternalMobileSession | null> {
  if (Platform.OS === 'web') {
    if (webSession.access && webSession.refresh) {
      return { accessToken: webSession.access, refreshToken: webSession.refresh };
    }
    return null;
  }

  await deleteLegacyIfPresent();

  try {
    const access = await SecureStore.getItemAsync(ACCESS_KEY);
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
    if (access && refresh) {
      return { accessToken: access, refreshToken: refresh };
    }
  } catch {
    return null;
  }

  return null;
}

export async function setStoredInternalMobileSession(accessToken: string, refreshToken: string): Promise<void> {
  if (Platform.OS === 'web') {
    webSession.access = accessToken;
    webSession.refresh = refreshToken;
    return;
  }
  await deleteLegacyIfPresent();
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken, secureOptions);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken, secureOptions);
}

export async function clearStoredInternalMobileSession(): Promise<void> {
  if (Platform.OS === 'web') {
    webSession.access = null;
    webSession.refresh = null;
    return;
  }
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
  } catch {
    // ignore
  }
  try {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    // ignore
  }
  try {
    await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
  } catch {
    // ignore
  }
}
