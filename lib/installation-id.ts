import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const INSTALLATION_KEY = 'insuringincome.internal.installation_id';

const secureOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Stable per-install identifier sent to the API as `device.installation_id`.
 */
export async function getOrCreateInstallationId(): Promise<string> {
  if (Platform.OS === 'web') {
    return `web-${Crypto.randomUUID()}`;
  }

  try {
    const existing = await SecureStore.getItemAsync(INSTALLATION_KEY);
    if (existing) {
      return existing;
    }
  } catch {
    // fall through to create
  }

  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_KEY, created, secureOptions);
  return created;
}
