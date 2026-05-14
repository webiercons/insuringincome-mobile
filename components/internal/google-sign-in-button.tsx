import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
};

export function GoogleSignInButton({ iosClientId, androidClientId, webClientId }: Props) {
  const { signInWithGoogleIdToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const lastHandledIdToken = useRef<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: iosClientId || undefined,
    androidClientId: androidClientId || undefined,
    webClientId: webClientId || undefined,
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }
    const idToken = response.params.id_token;
    if (!idToken || lastHandledIdToken.current === idToken) {
      return;
    }
    lastHandledIdToken.current = idToken;
    setBusy(true);
    void signInWithGoogleIdToken(idToken)
      .catch(() => {
        lastHandledIdToken.current = null;
      })
      .finally(() => {
        setBusy(false);
      });
  }, [response, signInWithGoogleIdToken]);

  const disabled = !request || busy;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => void promptAsync()}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {busy ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.label}>Continue with Google</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
