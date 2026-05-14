import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { InternalColors } from '@/constants/internal-theme';
import { useAuth } from '@/contexts/auth-context';
import { getPendingSsoLink, clearPendingSsoLink } from '@/lib/internal-auth-pending';
import { postInternalMobile } from '@/lib/internal-mobile-api';

export default function LinkWorkAccountScreen() {
  const { completeAuthExchange } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const linkSucceededRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      linkSucceededRef.current = false;
      return () => {
        if (!linkSucceededRef.current) {
          clearPendingSsoLink();
        }
      };
    }, []),
  );

  useEffect(() => {
    if (!getPendingSsoLink()) {
      router.replace('/(auth)/login');
    }
  }, []);

  async function onSubmit() {
    setError(null);
    const p = getPendingSsoLink();
    if (!p) {
      setError('This link step expired. Return to sign-in and use Apple or Google again.');
      return;
    }
    if (!password) {
      setError('Enter your internal account password to link this SSO identity.');
      return;
    }
    setBusy(true);
    try {
      const body = await postInternalMobile<unknown>(
        '/auth/link-sso',
        {
          sso_assertion: p.assertion,
          password,
          device: p.device,
        },
        null,
      );
      await completeAuthExchange(body);
      linkSucceededRef.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not link account');
    } finally {
      setBusy(false);
    }
  }

  const pending = getPendingSsoLink();
  if (!pending) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Link your work account</Text>
        <Text style={styles.sub}>
          Your {pending.provider === 'apple' ? 'Apple' : pending.provider === 'google' ? 'Google' : 'SSO'} identity
          matches <Text style={styles.emphasis}>{pending.maskedEmail}</Text> but is not yet linked to your internal
          Insuring Income operator profile. Confirm ownership with your existing operator password. You only need to do
          this once for this Apple or Google account.
        </Text>
        <Text style={styles.label}>Internal password</Text>
        <TextInput
          secureTextEntry
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={InternalColors.textMuted}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          onPress={() => void onSubmit()}
          disabled={busy}
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, busy && styles.disabled]}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryLabel}>Link and continue</Text>}
        </Pressable>
        <Pressable
          onPress={() => {
            clearPendingSsoLink();
            router.replace('/(auth)/login');
          }}
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
          <Text style={styles.linkLabel}>Back to sign-in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: InternalColors.background,
  },
  card: {
    backgroundColor: InternalColors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: InternalColors.border,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: InternalColors.text,
  },
  sub: {
    fontSize: 14,
    lineHeight: 21,
    color: InternalColors.textMuted,
    marginBottom: 8,
  },
  emphasis: {
    fontWeight: '700',
    color: InternalColors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: InternalColors.text,
    marginTop: 4,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: InternalColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    fontSize: 16,
    color: InternalColors.text,
    backgroundColor: '#f8fafc',
  },
  error: {
    color: InternalColors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  primary: {
    marginTop: 12,
    backgroundColor: InternalColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryPressed: { opacity: 0.92 },
  disabled: { opacity: 0.65 },
  primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 14, paddingVertical: 8, alignSelf: 'center' },
  linkPressed: { opacity: 0.85 },
  linkLabel: { fontSize: 15, fontWeight: '600', color: InternalColors.accentMuted },
});
